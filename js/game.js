/* =====================================================================
   Moteur du jeu : progression, écus, indices, boutique.
   Les fonctions "pures" en haut sont testées par test/check.js.
   ===================================================================== */
const START_COINS = 5;
const HINT_COST = 3;
const SAVE_KEY = "plume-save-v2";

/* Valeur d'une énigme selon son chapitre (difficulté 1 à 5). */
function baseValue(p){ return 10 + 5 * p.ch; }
/* Une erreur retire 20 % de la valeur, sans descendre sous 40 %. */
function afterMistake(p, value){ const b = baseValue(p); return Math.max(Math.ceil(b * 0.4), value - Math.ceil(b * 0.2)); }

/* Découpe le texte : "[faux|bon]." -> {shown:"faux.", word:"faux", fix:"bon"} */
function tokens(p){
  return p.text.split(" ").map(tok => {
    const m = tok.match(/^\[([^|\]]+)\|([^\]]+)\](.*)$/);
    return m ? { shown: m[1] + m[3], word: m[1], fix: m[2] } : { shown: tok };
  });
}
/* Normalise une saisie clavier : casse, espaces, apostrophe typographique, point final.
   Les accents sont conservés : ils font partie de l'orthographe ! */
function normalize(s){
  return s.normalize("NFC").replace(/[’`]/g, "'").replace(/\s+/g, " ").trim().replace(/[.!]+$/, "").trim().toLowerCase();
}
/* Vérifie une réponse. find : Set d'index ; fill : tableau de choix ; type : texte. */
function checkAnswer(p, answer){
  if (p.t === "find"){
    const bad = tokens(p).map((t, i) => t.fix ? i : -1).filter(i => i >= 0);
    return bad.length === answer.size && bad.every(i => answer.has(i));
  }
  if (p.t === "fill") return p.blanks.every((b, k) => b.a === answer[k]);
  return p.answers.some(a => normalize(a) === normalize(answer));
}

if (typeof module !== "undefined") module.exports = { baseValue, afterMistake, tokens, normalize, checkAnswer };

/* ============================ Interface ============================ */
if (typeof document !== "undefined") (function(){
  const app = document.getElementById("app");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  let save;
  try { save = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch(e) {}
  if (!save) save = { coins: START_COINS, solved: [], owned: [], equipped: {} };
  const persist = () => localStorage.setItem(SAVE_KEY, JSON.stringify(save));

  /* Énigmes débloquées : toutes les résolues + la suivante. */
  const nextIndex = () => { const i = PUZZLES.findIndex((_, k) => !save.solved.includes(k)); return i < 0 ? PUZZLES.length : i; };
  const unlocked = i => save.solved.includes(i) || i === nextIndex();

  let cur, idx, value, hintsShown, ans, active;

  function header(){
    return `<header><h1>🎩 Professeur Plume</h1><span class="money">🪙 ${save.coins} écus</span></header>`;
  }

  function home(){
    const n = nextIndex(), done = save.solved.length;
    app.innerHTML = header() + `
      <div class="card">
        <div class="scene">${drawScene(save.owned, save.equipped)}</div>
        <h2 style="margin-top:10px">Le Manuscrit Perdu</h2>
        <p>Le précieux manuscrit de Lord Dictée a disparu ! Aide le Professeur Plume à le retrouver :
        chaque indice est piégé par des fautes d'orthographe.</p>
        <div class="progress"><div style="width:${done * 100 / PUZZLES.length}%"></div></div>
        <div class="meta">${done} / ${PUZZLES.length} mystères résolus</div>
        <div class="bar">
          ${n < PUZZLES.length ? `<button onclick="G.start(${n})">▶ Mystère ${n + 1}</button>` : `<button disabled>🏆 Enquête terminée !</button>`}
          <button class="alt" onclick="G.list()">📜 Mystères</button>
          <button class="gold" onclick="G.shop()">🛍 Boutique</button>
        </div>
      </div>
      <div class="center"><button class="alt" onclick="G.reset()">Recommencer à zéro</button></div>`;
  }

  function list(){
    let html = "", last = 0;
    PUZZLES.forEach((p, i) => {
      if (p.ch !== last){ if (last) html += "</div>"; html += `<div class="chap">${CHAPTERS[p.ch]}</div><div class="grid">`; last = p.ch; }
      const ok = save.solved.includes(i);
      html += `<button class="${ok ? "alt" : ""}" ${unlocked(i) ? `onclick="G.start(${i})"` : "disabled"}>${ok ? "✔" : unlocked(i) ? "" : "🔒"}${i + 1}</button>`;
    });
    app.innerHTML = header() + `<div class="card"><h2>Les mystères</h2>
      <div class="meta">Résous-les dans l'ordre. Rejouer un mystère déjà résolu ne rapporte pas d'écus.</div>
      ${html}</div><div class="bar"><button class="alt" onclick="G.home()">⟵ Maison</button></div></div>`; // </div> ferme la dernière grille
  }

  function shop(){
    let html = "";
    Object.keys(SLOT_NAMES).forEach(slot => {
      html += `<div class="chap">${SLOT_NAMES[slot]}</div>`;
      ITEMS.filter(it => it.slot === slot).forEach(it => {
        const own = save.owned.includes(it.id), worn = save.equipped[slot] === it.id;
        let btn;
        if (!own) btn = `<button class="gold" ${save.coins < it.price ? "disabled" : ""} onclick="G.buy('${it.id}')">🪙 ${it.price}</button>`;
        else if (slot === "home") btn = `<span>✔ Installé</span>`;
        else btn = `<button class="alt" onclick="G.wear('${it.id}')">${worn ? "Retirer" : "Porter"}</button>`;
        html += `<div class="shop-item"><span>${esc(it.name)}</span>${btn}</div>`;
      });
    });
    app.innerHTML = header() + `<div class="card"><div class="scene">${drawScene(save.owned, save.equipped)}</div></div>
      <div class="card"><h2>La boutique</h2><div class="meta">Gagne des écus en résolvant des mystères.</div>${html}
      <div class="bar"><button class="alt" onclick="G.home()">⟵ Maison</button></div></div>`;
  }
  function buy(id){
    const it = ITEMS.find(x => x.id === id);
    if (!it || save.owned.includes(id) || save.coins < it.price) return;
    save.coins -= it.price; save.owned.push(id);
    if (it.slot !== "home") save.equipped[it.slot] = id;
    persist(); shop();
  }
  function wear(id){
    const it = ITEMS.find(x => x.id === id);
    save.equipped[it.slot] = save.equipped[it.slot] === id ? undefined : id;
    persist(); shop();
  }

  function start(i){
    if (!unlocked(i)) return;
    idx = i; cur = PUZZLES[i];
    value = save.solved.includes(i) ? 0 : baseValue(cur);
    hintsShown = 0; active = 0;
    ans = cur.t === "find" ? new Set() : cur.t === "fill" ? cur.blanks.map(() => null) : "";
    render();
  }

  function render(){
    const p = cur;
    let body = "", q = p.q;
    if (p.t === "find"){
      const nb = tokens(p).filter(t => t.fix).length;
      q = q || `Touche les ${nb} mots mal orthographiés, puis valide.`;
      body = `<div class="letter">${tokens(p).map((t, k) =>
        `<span class="w ${ans.has(k) ? "sel" : ""}" onclick="G.toggle(${k})">${esc(t.shown)}</span>`).join(" ")}</div>
        <p class="meta center">${ans.size} mot(s) sélectionné(s)</p>`;
    } else if (p.t === "fill"){
      q = q || "Touche chaque trou et choisis le bon mot.";
      body = `<div class="letter">${p.parts.map((txt, k) => esc(txt) + (k < p.blanks.length
        ? `<span class="blank ${active === k ? "active" : ""}" onclick="G.pick(${k})">${ans[k] ? esc(ans[k]) : "?"}</span>` : "")).join("")}</div>
        <div class="choices">${p.blanks[active].o.map((o, k) => `<button class="gold" onclick="G.choose(${k})">${esc(o)}</button>`).join("")}</div>`;
    } else {
      body = `<div class="letter">${esc(p.sentence).replace("___", '<span class="blank">?</span>')}</div>
        <input class="answer" id="answer" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          placeholder="Tape ta réponse ici" value="${esc(ans)}" oninput="G.typed(this.value)" onkeydown="if(event.key==='Enter')G.submit()">
        <div class="accents">${["é","è","ê","à","â","ç","ù","û","î","ô","ë","œ"].map(c => `<button class="alt" onclick="G.addChar('${c}')">${c}</button>`).join("")}</div>`;
    }
    const hints = p.hints.slice(0, hintsShown).map((h, k) => `<div class="hint">💡 <b>Indice ${k + 1}</b> : ${h}</div>`).join("");
    app.innerHTML = header() + `<div class="card">
      <div class="meta">${CHAPTERS[p.ch]}</div>
      <h2>Mystère ${idx + 1} — ${esc(p.title)}</h2>
      <div class="meta">Récompense : <b>${value}</b> écus · Difficulté ${"★".repeat(p.ch)}${"☆".repeat(5 - p.ch)}</div>
      <div class="story">${drawPortrait(save.equipped)}<span>${p.story}</span></div>
      <p><b>${q}</b></p>
      ${body}${hints}
      <div class="bar">
        <button class="alt" onclick="G.home()">⟵ Maison</button>
        <button class="alt" onclick="G.hint()" ${hintsShown >= p.hints.length ? "disabled" : ""}>💡 Indice (${HINT_COST} écus)</button>
        <button onclick="G.submit()">Valider ✔</button>
      </div></div>`;
  }

  function hint(){
    if (save.coins < HINT_COST){ alert(`Il te faut ${HINT_COST} écus pour un indice.`); return; }
    save.coins -= HINT_COST; hintsShown++; persist(); render();
  }

  function submit(){
    if (cur.t === "fill" && ans.some(v => v === null)){ alert("Complète tous les trous avant de valider !"); return; }
    if (cur.t === "type" && !ans.trim()){ alert("Tape ta réponse avant de valider !"); return; }
    const ok = checkAnswer(cur, ans);
    let gain = 0;
    if (ok && !save.solved.includes(idx)){ gain = value; save.coins += gain; save.solved.push(idx); persist(); }
    if (!ok && value > 0) value = afterMistake(cur, value);
    result(ok, gain);
  }

  function result(ok, gain){
    const p = cur;
    let detail = "";
    if (ok && p.t === "find") detail = "<p>" + tokens(p).filter(t => t.fix).map(t => `<s>${esc(t.word)}</s> → <b style="color:var(--ok)">${esc(t.fix)}</b>`).join(" · ") + "</p>";
    const last = idx === PUZZLES.length - 1;
    const o = document.createElement("div"); o.className = "overlay";
    o.innerHTML = `<div class="card">
      <div class="big ${ok ? "ok" : "ko"}">${ok ? "Bravo !" : "Pas encore..."}</div>
      ${ok ? `<p>« Remarquable ! Aucune faute ne t'échappe. »${gain ? `<br>Tu gagnes <b>🪙 ${gain} écus</b>.` : ""}</p>${detail}
              <div class="rule">📘 <b>À retenir</b><br>${p.rule}</div>
              ${last ? `<p><b>🏆 Le manuscrit est retrouvé ! Lord Dictée te remercie : l'enquête est terminée.</b></p>` : ""}`
           : `<p>« Hmm... ce n'est pas tout à fait ça. Réfléchis encore ! »</p>${value ? `<p>Ce mystère rapporte maintenant <b>${value}</b> écus.</p>` : ""}`}
      <div class="bar" style="justify-content:center">
        ${ok ? `<button class="alt" onclick="G.close();G.home()">Maison</button>${!last ? `<button onclick="G.close();G.start(${idx + 1})">Mystère suivant ⟶</button>` : ""}`
             : `<button onclick="G.close();G.render()">Réessayer</button>`}
      </div></div>`;
    document.body.appendChild(o);
  }

  window.G = {
    home, list, shop, buy, wear, start, render, hint, submit,
    toggle: k => { ans.has(k) ? ans.delete(k) : ans.add(k); render(); },
    pick: k => { active = k; render(); },
    choose: k => { ans[active] = cur.blanks[active].o[k]; const n = ans.findIndex(v => v === null); if (n >= 0) active = n; render(); },
    typed: v => { ans = v; },
    addChar: c => { const el = document.getElementById("answer"); ans = el.value + c; el.value = ans; el.focus(); },
    close: () => document.querySelector(".overlay")?.remove(),
    reset: () => { if (confirm("Effacer toute la progression ?")){ localStorage.removeItem(SAVE_KEY); location.reload(); } }
  };
  home();
})();
