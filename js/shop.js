/* =====================================================================
   Boutique et dessin (SVG) du Professeur Plume et de sa maison.
   slot : emplacement sur le professeur (un seul objet porté par slot).
   slot "home" : objet de décoration, toujours affiché une fois acheté.
   ===================================================================== */
const ITEMS = [
  // Chapeaux
  { id:"beret",    slot:"hat",  name:"Béret",                  price:30 },
  { id:"melon",    slot:"hat",  name:"Chapeau melon",          price:50 },
  { id:"explo",    slot:"hat",  name:"Casque d'explorateur",   price:70 },
  { id:"forme",    slot:"hat",  name:"Haut-de-forme",          price:100 },
  // Vestes
  { id:"tweed",    slot:"coat", name:"Veste en tweed",         price:40 },
  { id:"bleue",    slot:"coat", name:"Redingote bleue",        price:80 },
  { id:"cape",     slot:"coat", name:"Cape violette",          price:120 },
  // Cou
  { id:"noeud",    slot:"neck", name:"Nœud papillon",          price:20 },
  { id:"echarpe",  slot:"neck", name:"Écharpe rouge",          price:35 },
  // Visage
  { id:"lunettes", slot:"face", name:"Lunettes rondes",        price:25 },
  { id:"monocle",  slot:"face", name:"Monocle doré",           price:60 },
  // Main
  { id:"canne",    slot:"hand", name:"Canne",                  price:40 },
  { id:"loupe",    slot:"hand", name:"Loupe de détective",     price:55 },
  // Maison
  { id:"tapis",    slot:"home", name:"Tapis",                  price:25 },
  { id:"plante",   slot:"home", name:"Plante verte",           price:20 },
  { id:"rideaux",  slot:"home", name:"Rideaux",                price:30 },
  { id:"lampe",    slot:"home", name:"Lampe",                  price:35 },
  { id:"tableau",  slot:"home", name:"Tableau",                price:45 },
  { id:"globe",    slot:"home", name:"Globe terrestre",        price:60 },
  { id:"horloge",  slot:"home", name:"Horloge de parquet",     price:80 },
  { id:"lustre",   slot:"home", name:"Lustre",                 price:90 },
  { id:"biblio",   slot:"home", name:"Bibliothèque",           price:110 },
  { id:"chat",     slot:"home", name:"Chat de compagnie",      price:150 }
];
const SLOT_NAMES = { hat:"Chapeaux", coat:"Vestes", neck:"Cou", face:"Visage", hand:"Accessoires", home:"Maison" };

const SKIN = "#f1c27d";
const COAT_COLORS = { none:"#7a6a5a", tweed:"#8a5a2b", bleue:"#2c4a8a", cape:"#6a2c8a" };

/* ---------- Maison (décor, derrière le professeur) ---------- */
function drawHome(owned){
  const h = id => owned.includes(id);
  let s = "";
  // Mur, plinthe, parquet
  s += `<rect width="400" height="210" fill="#e9d8b4"/>
        <rect y="0" width="400" height="210" fill="url(#wall)"/>
        <rect y="200" width="400" height="10" fill="#7b4f2a"/>
        <rect y="210" width="400" height="90" fill="#a0703f"/>
        ${[0,1,2,3,4,5,6,7].map(i=>`<line x1="${i*55}" y1="210" x2="${i*55-30}" y2="300" stroke="#8a5d32"/>`).join("")}`;
  // Fenêtre
  s += `<rect x="250" y="30" width="80" height="80" fill="#9fd3f0" stroke="#5a3a1a" stroke-width="5"/>
        <line x1="290" y1="30" x2="290" y2="110" stroke="#5a3a1a" stroke-width="3"/>
        <line x1="250" y1="70" x2="330" y2="70" stroke="#5a3a1a" stroke-width="3"/>
        <circle cx="312" cy="50" r="8" fill="#fff6c0"/>`;
  if (h("rideaux")) s += `<path d="M242 22 h20 q-6 50 4 100 h-24z" fill="#a8323a"/><path d="M338 22 h-20 q6 50 -4 100 h24z" fill="#a8323a"/><rect x="238" y="18" width="104" height="6" fill="#5a3a1a"/>`;
  if (h("tableau")) s += `<rect x="120" y="40" width="54" height="44" fill="#c99a2e"/><rect x="126" y="46" width="42" height="32" fill="#4a7a5a"/><circle cx="158" cy="54" r="5" fill="#ffe08a"/><path d="M126 78 l14 -14 l10 8 l8 -6 l10 12z" fill="#2e5a3a"/>`;
  if (h("lustre")) s += `<line x1="200" y1="0" x2="200" y2="18" stroke="#5a3a1a" stroke-width="2"/><path d="M178 20 h44 l-8 12 h-28z" fill="#c99a2e"/>${[182,200,218].map(x=>`<rect x="${x-2}" y="10" width="4" height="10" fill="#fff"/><circle cx="${x}" cy="8" r="3" fill="#ffb020"/>`).join("")}`;
  if (h("biblio")) {
    s += `<rect x="12" y="60" width="86" height="185" fill="#6b3f1d"/>`;
    [70,112,154,196].forEach((y,r)=>{
      s += `<rect x="18" y="${y}" width="74" height="36" fill="#4a2a12"/>`;
      ["#a8323a","#2c4a8a","#2e7d32","#c99a2e","#6a2c8a","#8a5a2b"].forEach((c,i)=>{ if((i+r)%5!==4) s += `<rect x="${20+i*12}" y="${y+6+((i+r)%3)*2}" width="10" height="${30-((i+r)%3)*2}" fill="${c}"/>`; });
    });
  }
  if (h("horloge")) s += `<rect x="348" y="95" width="38" height="150" fill="#6b3f1d"/><circle cx="367" cy="118" r="14" fill="#fff8e0" stroke="#c99a2e" stroke-width="3"/><line x1="367" y1="118" x2="367" y2="108" stroke="#000" stroke-width="2"/><line x1="367" y1="118" x2="374" y2="121" stroke="#000" stroke-width="2"/><rect x="358" y="145" width="18" height="70" fill="#4a2a12"/><line x1="367" y1="148" x2="367" y2="195" stroke="#c99a2e" stroke-width="2"/><circle cx="367" cy="198" r="6" fill="#c99a2e"/>`;
  if (h("lampe")) s += `<line x1="320" y1="150" x2="320" y2="248" stroke="#3b2412" stroke-width="4"/><ellipse cx="320" cy="250" rx="14" ry="4" fill="#3b2412"/><path d="M304 150 h32 l-8 -28 h-16z" fill="#f2c94c"/>`;
  if (h("tapis")) s += `<ellipse cx="200" cy="278" rx="110" ry="18" fill="#8a2c2c"/><ellipse cx="200" cy="278" rx="96" ry="13" fill="none" stroke="#e0b050" stroke-width="2" stroke-dasharray="6 4"/>`;
  if (h("globe")) s += `<rect x="262" y="240" width="22" height="8" fill="#5a3a1a"/><line x1="273" y1="240" x2="273" y2="222" stroke="#5a3a1a" stroke-width="3"/><circle cx="273" cy="206" r="17" fill="#4a8ad0"/><path d="M262 198 q6 -6 12 0 q4 8 -4 12 q-8 2 -8 -12z M276 210 q6 -2 8 4 q-4 6 -10 2z" fill="#4caf50"/><path d="M254 206 a19 19 0 0 0 38 0" fill="none" stroke="#c99a2e" stroke-width="2"/>`;
  if (h("plante")) s += `<path d="M108 250 h30 l-4 -26 h-22z" fill="#b5651d"/><path d="M123 224 q-20 -20 -12 -40 q10 15 12 40 q2 -30 16 -42 q4 25 -16 42 q-4 -20 -22 -24 q8 18 22 24" fill="#2e7d32"/>`;
  return s;
}

/* ---------- Professeur ---------- */
function drawProfessor(eq){
  const coat = COAT_COLORS[eq.coat || "none"];
  let s = "";
  // Cape (derrière le corps)
  if (eq.coat === "cape") s += `<path d="M170 160 L146 262 h108 L230 160z" fill="#4a1c62"/>`;
  // Jambes et chaussures
  s += `<rect x="184" y="238" width="13" height="40" fill="#3b2a20"/><rect x="203" y="238" width="13" height="40" fill="#3b2a20"/>
        <ellipse cx="187" cy="281" rx="12" ry="6" fill="#1a1a1a"/><ellipse cx="213" cy="281" rx="12" ry="6" fill="#1a1a1a"/>`;
  // Corps (veste)
  s += `<path d="M172 158 h56 l12 88 h-80z" fill="${coat}"/>
        <path d="M192 158 h16 l-8 32z" fill="#fff"/>
        <line x1="200" y1="190" x2="200" y2="246" stroke="#00000033" stroke-width="2"/>
        ${[205,220,235].map(y=>`<circle cx="205" cy="${y}" r="2" fill="#c99a2e"/>`).join("")}`;
  if (eq.coat === "tweed") s += `<path d="M175 170 l50 0 M173 190 l54 0 M171 210 l58 0 M169 230 l62 0" stroke="#6b4420" stroke-width="1" stroke-dasharray="3 3"/>`;
  // Bras et mains
  s += `<rect x="157" y="162" width="15" height="62" rx="7" fill="${coat}" transform="rotate(8 164 162)"/>
        <rect x="228" y="162" width="15" height="62" rx="7" fill="${coat}" transform="rotate(-8 236 162)"/>
        <circle cx="160" cy="226" r="8" fill="${SKIN}"/><circle cx="240" cy="226" r="8" fill="${SKIN}"/>`;
  // Cou
  if (eq.neck === "noeud") s += `<path d="M200 164 l-12 -7 v14z M200 164 l12 -7 v14z" fill="#a8323a"/><circle cx="200" cy="164" r="3" fill="#7a1f26"/>`;
  if (eq.neck === "echarpe") s += `<path d="M180 154 q20 12 40 0 v10 q-20 12 -40 0z" fill="#c62828"/><path d="M212 160 l8 38 l-10 2 l-6 -38z" fill="#c62828"/>`;
  // Tête
  s += `<rect x="194" y="148" width="12" height="12" fill="${SKIN}"/>
        <circle cx="200" cy="128" r="27" fill="${SKIN}"/>
        <path d="M173 124 q-2 -26 27 -28 q29 2 27 28 q-4 -12 -10 -14 q-17 6 -34 0 q-6 2 -10 14z" fill="#cfcfcf"/>
        <ellipse cx="172" cy="130" rx="4" ry="7" fill="${SKIN}"/><ellipse cx="228" cy="130" rx="4" ry="7" fill="${SKIN}"/>
        <circle cx="190" cy="126" r="3" fill="#222"/><circle cx="210" cy="126" r="3" fill="#222"/>
        <path d="M185 118 l10 -2 M205 116 l10 2" stroke="#888" stroke-width="2"/>
        <path d="M200 129 l-3 8 h5" fill="none" stroke="#c48b52" stroke-width="2"/>
        <path d="M200 140 q-8 -4 -18 4 q10 0 18 -2 q8 2 18 2 q-10 -8 -18 -4z" fill="#9e9e9e"/>
        <path d="M193 147 q7 4 14 0" fill="none" stroke="#8a4a3a" stroke-width="2"/>`;
  // Visage
  if (eq.face === "lunettes") s += `<circle cx="190" cy="126" r="8" fill="#ffffff33" stroke="#333" stroke-width="2"/><circle cx="210" cy="126" r="8" fill="#ffffff33" stroke="#333" stroke-width="2"/><line x1="198" y1="126" x2="202" y2="126" stroke="#333" stroke-width="2"/>`;
  if (eq.face === "monocle") s += `<circle cx="210" cy="126" r="8" fill="#ffffff44" stroke="#c99a2e" stroke-width="2.5"/><path d="M217 130 q6 20 -4 34" fill="none" stroke="#c99a2e" stroke-width="1.5"/>`;
  // Chapeaux
  if (eq.hat === "beret") s += `<ellipse cx="203" cy="104" rx="30" ry="10" fill="#2a2a5a"/><circle cx="205" cy="94" r="3" fill="#2a2a5a"/>`;
  if (eq.hat === "melon") s += `<ellipse cx="200" cy="107" rx="36" ry="6" fill="#222"/><path d="M176 107 q0 -32 24 -32 q24 0 24 32z" fill="#222"/><rect x="176" y="100" width="48" height="5" fill="#5a3a1a"/>`;
  if (eq.hat === "explo") s += `<ellipse cx="200" cy="107" rx="40" ry="8" fill="#d8c08a"/><path d="M174 107 q0 -30 26 -30 q26 0 26 30z" fill="#e8d4a0"/><rect x="174" y="100" width="52" height="5" fill="#8a6a3a"/>`;
  if (eq.hat === "forme") s += `<ellipse cx="200" cy="106" rx="38" ry="6" fill="#111"/><rect x="178" y="56" width="44" height="50" fill="#111"/><rect x="178" y="92" width="44" height="8" fill="#a8323a"/>`;
  // Main droite
  if (eq.hand === "canne") s += `<line x1="248" y1="222" x2="258" y2="284" stroke="#3b2412" stroke-width="4"/><path d="M248 222 q-2 -12 -12 -8" fill="none" stroke="#c99a2e" stroke-width="5" stroke-linecap="round"/>`;
  if (eq.hand === "loupe") s += `<line x1="244" y1="222" x2="256" y2="202" stroke="#3b2412" stroke-width="5"/><circle cx="263" cy="190" r="13" fill="#cfefff99" stroke="#c99a2e" stroke-width="4"/>`;
  return s;
}

function drawCat(){
  return `<g transform="translate(140 252)"><ellipse cx="20" cy="22" rx="20" ry="12" fill="#ff9e3d"/><circle cx="2" cy="12" r="11" fill="#ff9e3d"/>
    <path d="M-7 4 l3 -10 l5 7z M5 3 l4 -10 l3 9z" fill="#ff9e3d"/><circle cx="-2" cy="11" r="1.6" fill="#000"/><circle cx="6" cy="11" r="1.6" fill="#000"/>
    <path d="M38 20 q14 -4 8 -18" fill="none" stroke="#ff9e3d" stroke-width="5" stroke-linecap="round"/></g>`;
}

/* Scène complète : maison + professeur (+ chat devant). */
function drawScene(owned, equipped){
  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Le Professeur Plume dans sa maison">
    <defs><pattern id="wall" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M10 0 v20" stroke="#dcc79c" stroke-width="2"/></pattern></defs>
    ${drawHome(owned)}${drawProfessor(equipped)}${owned.includes("chat") ? drawCat() : ""}</svg>`;
}

/* Professeur seul (petit portrait pour les énigmes). */
function drawPortrait(equipped){
  return `<svg viewBox="140 50 120 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${drawProfessor(equipped)}</svg>`;
}

if (typeof module !== "undefined") module.exports = { ITEMS, SLOT_NAMES, drawScene, drawPortrait };
