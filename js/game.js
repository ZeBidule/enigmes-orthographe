/* =====================================================================
   Moteur du jeu : progression, écus, indices, boutique.
   Les fonctions "pures" en haut sont testées par test/check.js.
   ===================================================================== */
const START_COINS = 5;
const HINT_COST = 3;
const SAVE_KEY = "plume-save-v2";

/* Valeur d'une énigme selon son chapitre (difficulté 1 à 5). */
function baseValue(p){ return p.reward || 10 + 5 * p.lvl; }
/* Une erreur retire 20 % de la valeur, sans descendre sous 40 %. Les bonus gardent leur récompense fixe. */
function afterMistake(p, value){ if (p.reward) return value; const b = baseValue(p); return Math.max(Math.ceil(b * 0.4), value - Math.ceil(b * 0.2)); }

/* Découpe le texte : "l'[faux|bon]." -> {shown:"l'faux.", word:"faux", fix:"bon"} */
function tokens(p){
  return p.text.split(" ").map(tok => {
    const m = tok.match(/^([^\[]*)\[([^|\]]+)\|([^\]]+)\](.*)$/);
    return m ? { shown: m[1] + m[2] + m[4], word: m[2], fix: m[3] } : { shown: tok };
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

const GAME_TITLE = "Plume & Cie";
const GAME_SUBTITLE = "L'Affaire du Manuscrit Perdu";
const SAVE_FORMAT = "plume-et-cie-save";

/* Contenu du fichier de sauvegarde. */
function exportSave(save){
  return JSON.stringify({ format: SAVE_FORMAT, version: 2, date: new Date().toISOString(),
    coins: save.coins, solved: save.solved, owned: save.owned, equipped: save.equipped }, null, 2);
}
/* Lit et valide un fichier de sauvegarde. Lève une erreur si le fichier est invalide.
   Les valeurs inconnues (énigme ou objet inexistant) sont ignorées. */
/* Anciennes versions (50 énigmes) : progression enregistrée par position (0 = p01). */
function migrateSolved(list){ return list.map(x => Number.isInteger(x) ? "p" + String(x + 1).padStart(2, "0") : x); }
function importSave(text, puzzleIds, items){
  let d;
  try { d = JSON.parse(text); } catch(e) { throw new Error("Ce fichier n'est pas une sauvegarde valide."); }
  if (!d || d.format !== SAVE_FORMAT) throw new Error("Ce fichier n'est pas une sauvegarde de " + GAME_TITLE + ".");
  if (!Number.isInteger(d.coins) || d.coins < 0 || !Array.isArray(d.solved) || !Array.isArray(d.owned))
    throw new Error("Sauvegarde abîmée : impossible de la charger.");
  const ids = items.map(i => i.id);
  const solved = [...new Set(migrateSolved(d.solved))].filter(id => puzzleIds.includes(id));
  const owned = [...new Set(d.owned)].filter(id => ids.includes(id));
  const equipped = {};
  Object.entries(d.equipped || {}).forEach(([slot, id]) => {
    const it = items.find(i => i.id === id);
    if (it && it.slot === slot && !["home", "garden", "vehicle"].includes(slot) && owned.includes(id)) equipped[slot] = id;
  });
  return { coins: d.coins, solved, owned, equipped };
}

/* Solution d'une énigme, au format attendu par checkAnswer (mode test). */
function solutionFor(p){
  if (p.t === "find") return new Set(tokens(p).map((t, i) => t.fix ? i : -1).filter(i => i >= 0));
  if (p.t === "fill") return p.blanks.map(b => b.a);
  return p.answers[0];
}
const TEST_PASSWORD = "tes1";

if (typeof module !== "undefined") module.exports = { baseValue, afterMistake, tokens, normalize, checkAnswer, exportSave, importSave, migrateSolved, START_COINS, HINT_COST, solutionFor, TEST_PASSWORD, GAME_TITLE };

/* ============================ Interface ============================ */
if (typeof document !== "undefined") (function(){
  const app = document.getElementById("app");
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  let save;
  try { save = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch(e) {}
  if (!save) save = { coins: START_COINS, solved: [], owned: [], equipped: {} };
  save.solved = migrateSolved(save.solved);
  const persist = () => localStorage.setItem(SAVE_KEY, JSON.stringify(save));

  /* Énigmes débloquées : toutes les résolues + la suivante. */
  const nextIndex = () => { const i = PUZZLES.findIndex(p => !save.solved.includes(p.id)); return i < 0 ? PUZZLES.length : i; };
  const mainDone = () => PUZZLES.filter(p => !p.bonus && save.solved.includes(p.id)).length;
  const bonusDone = () => PUZZLES.filter(p => p.bonus && save.solved.includes(p.id)).length;
  const progressText = () => `${mainDone()} / ${MAIN_COUNT} mystères résolus` +
    (mainDone() === MAIN_COUNT ? ` · ⭐ ${bonusDone()} / ${PUZZLES.length - MAIN_COUNT} bonus` : "");
  const unlocked = i => save.test || save.solved.includes(PUZZLES[i].id) || i === nextIndex();
  /* Mode test : écus illimités (rien n'est débité). */
  const canPay = n => save.test || save.coins >= n;
  const pay = n => { if (!save.test) save.coins -= n; };

  let cur, idx, value, hintsShown, ans, active;

  function header(){
    return `<header><h1>🎩 ${GAME_TITLE}${save.test ? ' <span class="test-badge">TEST</span>' : ""}</h1><span class="money">🪙 ${save.test ? "∞" : save.coins} écus</span></header>`;
  }

  /* ---------- Écran titre ---------- */
  function title(){
    const started = save.solved.length > 0 || save.owned.length > 0;
    app.innerHTML = `<div class="title-screen">
      <div class="title-logo"><div class="t1">${GAME_TITLE}</div><div class="t2">${GAME_SUBTITLE}</div></div>
      <div class="title-prof">${drawPortrait(save.equipped)}</div>
      <p class="title-pitch">Un manuscrit a disparu. Des indices pleins de fautes.<br>Seul un œil expert en orthographe pourra résoudre l'affaire !</p>
      <div class="title-buttons">
        <button onclick="G.home()">${started ? "▶ Continuer l'enquête" : "▶ Nouvelle enquête"}</button>
        <button class="gold" onclick="G.load()">📂 Charger une sauvegarde</button>
        <button class="alt key-btn" onclick="G.testMenu()" title="Menu de test" aria-label="Menu de test">🔑</button>
      </div>
      ${started ? `<div class="meta" style="color:var(--parch)">${progressText()} · 🪙 ${save.coins} écus</div>` : ""}
      <div class="meta" style="color:var(--parch);opacity:.6">Un jeu pour réviser l'orthographe française</div>
    </div>`;
  }

  /* ---------- Sauvegarde dans un fichier ---------- */
  function download(){
    const blob = new Blob([exportSave(save)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `plume-et-cie-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("💾 Sauvegarde téléchargée !");
  }
  function load(){
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json,application/json"; input.id = "load-file";
    input.style.display = "none";
    input.onchange = () => {
      const f = input.files[0]; input.remove();
      if (!f) return;
      f.text().then(text => {
        try {
          const s = importSave(text, PUZZLES.map(p => p.id), ITEMS);
          if (!confirm(`Charger cette sauvegarde ?\n${s.solved.length} mystères résolus, ${s.coins} écus, ${s.owned.length} objets.\nLa progression actuelle sera remplacée.`)) return;
          save = s; persist(); home(); toast("📂 Sauvegarde chargée !");
        } catch(e) { alert(e.message); }
      });
    };
    document.body.appendChild(input); input.click();
  }
  function toast(msg){
    const t = document.createElement("div"); t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2500);
  }

  function home(){
    const n = nextIndex(), done = mainDone();
    app.innerHTML = header() + `
      <div class="card">
        <div class="scene">${drawScene(save.owned, save.equipped)}</div>
        <div class="scene" style="margin-top:8px">${drawGarden(save.owned)}</div>
        <h2 style="margin-top:10px">${GAME_SUBTITLE}</h2>
        <p>Le précieux manuscrit de Lord Dictée a disparu ! Aide le Professeur Plume à le retrouver :
        chaque indice est piégé par des fautes d'orthographe.</p>
        <div class="progress"><div style="width:${done * 100 / MAIN_COUNT}%"></div></div>
        <div class="meta">${progressText()}</div>
        <div class="bar">
          ${n >= PUZZLES.length ? `<button disabled>🏆 Tout est résolu !</button>`
            : PUZZLES[n].bonus ? `<button class="gold" onclick="G.start(${n})">⭐ Bonus ${n - MAIN_COUNT + 1}</button>`
            : `<button onclick="G.start(${n})">▶ Mystère ${n + 1}</button>`}
          <button class="alt" onclick="G.list()">📜 Mystères</button>
          <button class="gold" onclick="G.shop()">🛍 Boutique</button>
        </div>
      </div>
      <div class="card"><h2>Sauvegarde</h2>
        <div class="meta">Enregistre ta progression (mystères et objets achetés) dans un fichier, pour la garder ou la transférer sur un autre appareil.</div>
        <div class="bar">
          <button class="gold" onclick="G.download()">💾 Sauvegarder</button>
          <button class="gold" onclick="G.load()">📂 Charger</button>
          <button class="alt" onclick="G.reset()">Recommencer à zéro</button>
          <button class="alt" onclick="G.title()">⟵ Menu principal</button>
        </div></div>`;
  }

  function list(){
    let html = "", last = 0;
    PUZZLES.forEach((p, i) => {
      if (p.ch !== last){ if (last) html += "</div>"; html += `<div class="chap">${CHAPTERS[p.ch]}</div><div class="grid">`; last = p.ch; }
      const ok = save.solved.includes(p.id);
      html += `<button class="${ok ? "alt" : ""}" ${unlocked(i) ? `onclick="G.start(${i})"` : "disabled"}>${ok ? "✔" : unlocked(i) ? "" : "🔒"}${p.bonus ? "B" + (i - MAIN_COUNT + 1) : i + 1}</button>`;
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
        if (!own) btn = `<button class="gold" ${save.coins < it.price && !save.test ? "disabled" : ""} onclick="G.buy('${it.id}')">🪙 ${it.price}</button>`;
        else if (DECOR_SLOTS.includes(slot)) btn = `<span>✔ Installé</span>`;
        else btn = `<button class="alt" onclick="G.wear('${it.id}')">${worn ? "Retirer" : "Porter"}</button>`;
        html += `<div class="shop-item"><span>${esc(it.name)}</span>${btn}</div>`;
      });
    });
    app.innerHTML = header() + `<div class="card"><div class="scene">${drawScene(save.owned, save.equipped)}</div>
      <div class="scene" style="margin-top:8px">${drawGarden(save.owned)}</div></div>
      <div class="card"><h2>La boutique</h2><div class="meta">Gagne des écus en résolvant des mystères.</div>${html}
      <div class="bar"><button class="alt" onclick="G.home()">⟵ Maison</button></div></div>`;
  }
  function buy(id){
    const it = ITEMS.find(x => x.id === id);
    if (!it || save.owned.includes(id) || !canPay(it.price)) return;
    pay(it.price); save.owned.push(id);
    if (!DECOR_SLOTS.includes(it.slot)) save.equipped[it.slot] = id;
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
    value = save.solved.includes(cur.id) ? 0 : baseValue(cur);
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
      <h2>${p.bonus ? `⭐ Bonus ${idx - MAIN_COUNT + 1}` : `Mystère ${idx + 1}`} — ${esc(p.title)}</h2>
      <div class="meta">Récompense : <b>${value}</b> écus · Difficulté ${"★".repeat(p.lvl)}${"☆".repeat(5 - p.lvl)}</div>
      <div class="story">${drawPortrait(save.equipped)}<span>${p.story}</span></div>
      <p><b>${q}</b></p>
      ${body}${hints}
      <div class="bar">
        <button class="alt" onclick="G.home()">⟵ Maison</button>
        <button class="alt" onclick="G.hint()" ${hintsShown >= p.hints.length ? "disabled" : ""}>💡 Indice (${HINT_COST} écus)</button>
        <button onclick="G.submit()">Valider ✔</button>
        ${save.test ? `<button class="gold" onclick="G.solve()">🧪 Solution</button>` : ""}
      </div></div>`;
  }

  function hint(){
    if (!canPay(HINT_COST)){ alert(`Il te faut ${HINT_COST} écus pour un indice.`); return; }
    pay(HINT_COST); hintsShown++; persist(); render();
  }

  /* Mode test : remplit la bonne réponse puis valide. */
  function solve(){
    if (!save.test) return;
    ans = solutionFor(cur);
    render(); submit();
  }

  /* ---------- Menu de test (bouton 🔑 du menu principal) ---------- */
  function testMenu(){
    G.close();
    const o = document.createElement("div"); o.className = "overlay";
    o.innerHTML = save.test
      ? `<div class="card"><h2>🧪 Menu de test</h2>
          <p>Mode test <b>actif</b> : tous les mystères sont débloqués, les écus sont illimités et un bouton « 🧪 Solution » valide chaque mystère.</p>
          <div class="bar" style="justify-content:center">
            <button class="alt" onclick="G.testOff()">Désactiver le mode test</button>
            <button onclick="G.close()">Fermer</button></div></div>`
      : `<div class="card"><h2>🧪 Menu de test</h2>
          <input class="answer" id="test-pwd" type="password" placeholder="Mot de passe" autocomplete="off"
            onkeydown="if(event.key==='Enter')G.testOn()">
          <p id="test-err" style="color:var(--ko);min-height:1.2em"></p>
          <div class="bar" style="justify-content:center">
            <button class="alt" onclick="G.close()">Annuler</button>
            <button onclick="G.testOn()">Déverrouiller</button></div></div>`;
    document.body.appendChild(o);
    document.getElementById("test-pwd")?.focus();
  }
  function testOn(){
    if (document.getElementById("test-pwd").value !== TEST_PASSWORD){
      document.getElementById("test-err").textContent = "Mot de passe incorrect."; return;
    }
    save.test = true; persist(); G.close(); home(); toast("🧪 Mode test activé");
  }
  function testOff(){ delete save.test; persist(); G.close(); home(); toast("Mode test désactivé"); }

  function submit(){
    if (cur.t === "fill" && ans.some(v => v === null)){ alert("Complète tous les trous avant de valider !"); return; }
    if (cur.t === "type" && !ans.trim()){ alert("Tape ta réponse avant de valider !"); return; }
    const ok = checkAnswer(cur, ans);
    let gain = 0;
    if (ok && !save.solved.includes(cur.id)){ gain = value; save.coins += gain; save.solved.push(cur.id); persist(); }
    if (!ok && value > 0) value = afterMistake(cur, value);
    result(ok, gain);
  }

  function result(ok, gain){
    const p = cur;
    let detail = "";
    if (ok && p.t === "find") detail = "<p>" + tokens(p).filter(t => t.fix).map(t => `<s>${esc(t.word)}</s> → <b style="color:var(--ok)">${esc(t.fix)}</b>`).join(" · ") + "</p>";
    const last = idx === PUZZLES.length - 1, endOfStory = idx === MAIN_COUNT - 1;
    const o = document.createElement("div"); o.className = "overlay";
    o.innerHTML = `<div class="card">
      <div class="big ${ok ? "ok" : "ko"}">${ok ? "Bravo !" : "Pas encore..."}</div>
      ${ok ? `<p>« Remarquable ! Aucune faute ne t'échappe. »${gain ? `<br>Tu gagnes <b>🪙 ${gain} écus</b>.` : ""}</p>${detail}
              <div class="rule">📘 <b>À retenir</b><br>${p.rule}</div>
              ${endOfStory ? `<p><b>🏆 Le manuscrit est retrouvé ! Lord Dictée te remercie : l'enquête est terminée.</b><br>⭐ ${PUZZLES.length - MAIN_COUNT} mystères bonus sont débloqués dans les archives secrètes !</p>` : ""}
              ${last ? `<p><b>🏆 Tu as percé tous les secrets des archives. Bravo, expert de l'orthographe !</b></p>` : ""}`
           : `<p>« Hmm... ce n'est pas tout à fait ça. Réfléchis encore ! »</p>${value ? `<p>Ce mystère rapporte maintenant <b>${value}</b> écus.</p>` : ""}`}
      <div class="bar" style="justify-content:center">
        ${ok ? `<button class="alt" onclick="G.close();G.home()">Maison</button>${!last ? `<button onclick="G.close();G.start(${idx + 1})">${PUZZLES[idx + 1].bonus ? "⭐ Bonus suivant" : "Mystère suivant"} ⟶</button>` : ""}`
             : `<button onclick="G.close();G.render()">Réessayer</button>`}
      </div></div>`;
    document.body.appendChild(o);
  }

  window.G = {
    home, title, download, load, list, shop, buy, wear, start, render, hint, submit, solve, testMenu, testOn, testOff,
    toggle: k => { ans.has(k) ? ans.delete(k) : ans.add(k); render(); },
    pick: k => { active = k; render(); },
    choose: k => { ans[active] = cur.blanks[active].o[k]; const n = ans.findIndex(v => v === null); if (n >= 0) active = n; render(); },
    typed: v => { ans = v; },
    addChar: c => { const el = document.getElementById("answer"); ans = el.value + c; el.value = ans; el.focus(); },
    close: () => document.querySelector(".overlay")?.remove(),
    reset: () => { if (confirm("Effacer toute la progression ?")){ localStorage.removeItem(SAVE_KEY); location.reload(); } }
  };
  title();
})();
