/* SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Plume & Cie : L'Affaire du Manuscrit Perdu
 * Copyright (C) 2026 ZeBidule
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Code source / source code : https://github.com/ZeBidule/enigmes-orthographe
 */
/* =====================================================================
   Boutique et dessin (SVG) du Professeur Plume et de sa maison.
   slot : emplacement sur le professeur (un seul objet porté par slot).
   slots de décor (DECOR_SLOTS : home, garden, vehicle) : toujours affichés une fois achetés,
   dans la maison (home) ou dans le jardin (garden, vehicle).
   ===================================================================== */
const ITEMS = [
  // Chapeaux
  { id:"beret",    slot:"hat",  name:"Béret",                  price:20 },
  { id:"melon",    slot:"hat",  name:"Chapeau melon",          price:35 },
  { id:"explo",    slot:"hat",  name:"Casque d'explorateur",   price:50 },
  { id:"forme",    slot:"hat",  name:"Haut-de-forme",          price:70 },
  // Vestes
  { id:"tweed",    slot:"coat", name:"Veste en tweed",         price:25 },
  { id:"bleue",    slot:"coat", name:"Redingote bleue",        price:55 },
  { id:"cape",     slot:"coat", name:"Cape violette",          price:85 },
  // Cou
  { id:"noeud",    slot:"neck", name:"Nœud papillon",          price:10 },
  { id:"echarpe",  slot:"neck", name:"Écharpe rouge",          price:25 },
  // Visage
  { id:"lunettes", slot:"face", name:"Lunettes rondes",        price:15 },
  { id:"monocle",  slot:"face", name:"Monocle doré",           price:40 },
  // Main
  { id:"canne",    slot:"hand", name:"Canne",                  price:25 },
  { id:"loupe",    slot:"hand", name:"Loupe de détective",     price:40 },
  // Maison
  { id:"tapis",    slot:"home", name:"Tapis",                  price:15 },
  { id:"plante",   slot:"home", name:"Plante verte",           price:10 },
  { id:"rideaux",  slot:"home", name:"Rideaux",                price:20 },
  { id:"lampe",    slot:"home", name:"Lampe",                  price:25 },
  { id:"tableau",  slot:"home", name:"Tableau",                price:30 },
  { id:"globe",    slot:"home", name:"Globe terrestre",        price:40 },
  { id:"horloge",  slot:"home", name:"Horloge de parquet",     price:55 },
  { id:"lustre",   slot:"home", name:"Lustre",                 price:65 },
  { id:"biblio",   slot:"home", name:"Bibliothèque",           price:80 },
  { id:"chat",     slot:"home", name:"Chat de compagnie",      price:110 },
  // Jardin
  { id:"fleurs",   slot:"garden", name:"Parterre de fleurs",   price:25 },
  { id:"potager",  slot:"garden", name:"Potager",              price:40 },
  { id:"lampadaire", slot:"garden", name:"Lampadaire",         price:50 },
  { id:"banc",     slot:"garden", name:"Banc",                 price:55 },
  { id:"arbre",    slot:"garden", name:"Grand chêne",          price:70 },
  { id:"niche",    slot:"garden", name:"Niche et son chien",   price:110 },
  { id:"cabane",   slot:"garden", name:"Cabane de jardin",     price:115 },
  { id:"fontaine", slot:"garden", name:"Fontaine",             price:145 },
  // Véhicules
  { id:"velo",     slot:"vehicle", name:"Vélo",                price:65 },
  { id:"voiture",  slot:"vehicle", name:"Voiture ancienne",    price:220 },
  { id:"ballon",   slot:"vehicle", name:"Montgolfière",        price:290 }
];
const DECOR_SLOTS = ["home", "garden", "vehicle"];
const SLOT_NAMES = { hat:"Chapeaux", coat:"Vestes", neck:"Cou", face:"Visage", hand:"Accessoires", home:"Maison", garden:"Jardin", vehicle:"Véhicules" };

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
  if (h("globe")) s += `<g stroke="#3b2412" stroke-width="1"><path d="M273 228 l-22 22 h5 l19 -17 l19 17 h5z" fill="#6b3f1d"/><rect x="270" y="200" width="6" height="30" fill="#7a4a22"/><ellipse cx="273" cy="212" rx="5" ry="3" fill="#8a5a2b"/><ellipse cx="273" cy="226" rx="6" ry="3" fill="#8a5a2b"/></g><circle cx="273" cy="168" r="24" fill="#e8d5a3" stroke="#8a6a3a" stroke-width="1"/><path d="M258 156 q8 -8 16 -2 q2 8 -6 10 q-2 8 -8 4 q-6 -4 -2 -12z M276 168 q8 -4 12 4 q-2 10 -10 12 q-4 -6 -2 -16z M262 178 q4 2 4 8 q-4 0 -6 -4z" fill="#9a7444" opacity=".85"/><g fill="none" stroke="#a88a5a" stroke-width=".6"><ellipse cx="273" cy="168" rx="10" ry="24"/><ellipse cx="273" cy="168" rx="24" ry="8"/><line x1="249" y1="168" x2="297" y2="168"/></g><circle cx="273" cy="168" r="28" fill="none" stroke="#c99a2e" stroke-width="3"/><ellipse cx="273" cy="172" rx="31" ry="6" fill="none" stroke="#a87a1e" stroke-width="3"/><line x1="273" y1="196" x2="273" y2="202" stroke="#c99a2e" stroke-width="3"/><circle cx="273" cy="139" r="2.5" fill="#c99a2e"/>`;
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
  const o = "#e08a3c", d = "#a8521e";
  return `<g transform="translate(140 252)">
    <ellipse cx="20" cy="18" rx="30" ry="4" fill="#8a5d2c"/><ellipse cx="20" cy="18" rx="27" ry="2.5" fill="#a8323a"/>
    <path d="M-2 20 q1 -13 10 -14 h20 q12 0 14 13 z" fill="${o}"/>
    <path d="M10 7 q2 4 0 9 M17 6 q2 5 0 10 M24 6 q2 5 0 10 M31 7 q2 4 0 9" fill="none" stroke="${d}" stroke-width="2" stroke-linecap="round"/>
    <path d="M40 18 q12 -2 8 -14" fill="none" stroke="${o}" stroke-width="4" stroke-linecap="round"/>
    <path d="M44 12 l4 -1 M46 7 l4 0" stroke="${d}" stroke-width="2"/>
    <path d="M-4 4 l1 -11 l6 6z M6 -1 l5 -7 l2 10z" fill="${o}"/><path d="M-2 0 l1 -5 l3 3z M8 -1 l3 -4 l1 5z" fill="#f2b8a0"/>
    <ellipse cx="3" cy="6" rx="10" ry="8.5" fill="${o}"/>
    <path d="M0 -1 v3 M3 -2 v4 M6 -1 v3 M-6 5 h3 M10 5 h3" stroke="${d}" stroke-width="1.4" stroke-linecap="round"/>
    <ellipse cx="3" cy="10" rx="5" ry="3.5" fill="#f8e0c0"/>
    <ellipse cx="-1" cy="5" rx="1.8" ry="1.4" fill="#4a8a2a"/><ellipse cx="7" cy="5" rx="1.8" ry="1.4" fill="#4a8a2a"/>
    <rect x="-1.4" y="3.8" width=".8" height="2.4" fill="#111"/><rect x="6.6" y="3.8" width=".8" height="2.4" fill="#111"/>
    <path d="M2 8.5 h2 l-1 1.2z" fill="#d06a7a"/>
    <path d="M-1 10 l-9 -1 M-1 11 l-9 2 M7 10 l9 -1 M7 11 l9 2" stroke="#fff" stroke-width=".5"/>
    <path d="M-10 18 a30 3 0 0 0 60 0 l-4 10 h-52z" fill="#c9954a"/>
    <g fill="none" stroke="#8a5d2c" stroke-width="1.2">${[22,26].map(y=>`<path d="M${-9+(y-18)*.4} ${y} h${58-(y-18)*.8}"/>`).join("")}${[0,8,16,24,32,40].map(x=>`<path d="M${x} 21 v7"/>`).join("")}</g>
    <path d="M-10 18 a30 3 0 0 0 60 0" fill="none" stroke="#8a5d2c" stroke-width="3"/></g>`;
}

/* Scène complète : maison + professeur (+ chat devant). */
function drawScene(owned, equipped){
  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Le Professeur Plume dans sa maison">
    <defs><pattern id="wall" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M10 0 v20" stroke="#dcc79c" stroke-width="2"/></pattern></defs>
    ${drawHome(owned)}${drawProfessor(equipped)}${owned.includes("chat") ? drawCat() : ""}</svg>`;
}


/* ---------- Jardin (extérieur) ---------- */
function drawGarden(owned){
  const h = id => owned.includes(id);
  let s = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Le jardin du Professeur Plume">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0f5"/><stop offset="1" stop-color="#d9f1ff"/></linearGradient></defs>
    <rect width="400" height="130" fill="url(#sky)"/>
    <circle cx="330" cy="30" r="16" fill="#ffe27a"/>
    <path d="M0 125 q80 -40 170 -5 q90 -35 230 0 v20 H0z" fill="#8cc06a"/>
    <rect y="125" width="400" height="95" fill="#6fae4c"/>
    <path d="M60 170 q20 25 0 50 h40 q-20 -25 0 -50z" fill="#d8c08a"/>`;
  // Maison (façade, toujours présente)
  s += `<rect x="15" y="80" width="110" height="90" fill="#e9d8b4" stroke="#7b4f2a" stroke-width="2"/>
    <path d="M5 82 L70 38 L135 82z" fill="#a8323a"/>
    <rect x="58" y="125" width="24" height="45" fill="#6b3f1d"/><circle cx="77" cy="148" r="2" fill="#c99a2e"/>
    <rect x="25" y="95" width="24" height="22" fill="#9fd3f0" stroke="#5a3a1a" stroke-width="3"/>
    <rect x="91" y="95" width="24" height="22" fill="#9fd3f0" stroke="#5a3a1a" stroke-width="3"/>
    <rect x="100" y="45" width="12" height="25" fill="#7b4f2a"/>`;
  if (h("ballon")) s += `<g><path d="M225 70 q-30 -20 -30 -42 a30 30 0 0 1 60 0 q0 22 -30 42z" fill="#e2563d"/>
    <path d="M225 70 q-12 -20 -12 -42 a12 30 0 0 1 24 0 q0 22 -12 42z" fill="#f2c94c"/>
    <line x1="215" y1="64" x2="218" y2="78" stroke="#5a3a1a"/><line x1="235" y1="64" x2="232" y2="78" stroke="#5a3a1a"/>
    <rect x="216" y="78" width="18" height="12" fill="#8a5a2b"/></g>`;
  if (h("arbre")) s += `<rect x="352" y="100" width="16" height="72" fill="#6b3f1d"/><circle cx="360" cy="85" r="34" fill="#3e8e3a"/><circle cx="338" cy="98" r="20" fill="#357a32"/><circle cx="382" cy="98" r="20" fill="#357a32"/>`;
  if (h("cabane")) s += `<rect x="272" y="118" width="48" height="40" fill="#a0703f" stroke="#6b3f1d" stroke-width="2"/><path d="M266 120 l30 -22 l30 22z" fill="#6b3f1d"/><rect x="288" y="132" width="16" height="26" fill="#5a3a1a"/>`;
  if (h("potager")) s += [0, 1, 2].map(r => `<rect x="140" y="${132 + r * 9}" width="62" height="6" fill="#7b4f2a"/>` + [0, 1, 2, 3, 4].map(k => `<circle cx="${146 + k * 12}" cy="${131 + r * 9}" r="3.5" fill="${r === 1 ? "#e2563d" : "#4caf50"}"/>`).join("")).join("");
  if (h("lampadaire")) s += `<line x1="136" y1="120" x2="136" y2="200" stroke="#2a2a2a" stroke-width="4"/><path d="M128 120 h16 l-4 -12 h-8z" fill="#2a2a2a"/><circle cx="136" cy="116" r="4" fill="#ffe27a"/>`;
  if (h("fontaine")) s += `<ellipse cx="195" cy="192" rx="32" ry="9" fill="#9aa5ad"/><ellipse cx="195" cy="189" rx="26" ry="6" fill="#4a9ad8"/><rect x="190" y="160" width="10" height="30" fill="#9aa5ad"/><ellipse cx="195" cy="160" rx="14" ry="4" fill="#9aa5ad"/><path d="M195 158 q-12 -18 -18 8 M195 158 q12 -18 18 8" fill="none" stroke="#7cc4f0" stroke-width="2"/>`;
  if (h("banc")) s += `<rect x="236" y="176" width="54" height="6" fill="#8a5a2b"/><rect x="236" y="166" width="54" height="5" fill="#8a5a2b"/><rect x="240" y="182" width="4" height="14" fill="#3b2412"/><rect x="282" y="182" width="4" height="14" fill="#3b2412"/>`;
  if (h("niche")) s += `<rect x="300" y="172" width="38" height="28" fill="#c0392b"/><path d="M296 174 l23 -16 l23 16z" fill="#7b241c"/><path d="M312 200 v-14 a7 7 0 0 1 14 0 v14z" fill="#3b2412"/>
    <g transform="translate(330 186)"><path d="M4 6 q-7 -3 -6 -12" fill="none" stroke="#9a6d36" stroke-width="2.5" stroke-linecap="round"/><path d="M6 12 l-1 9 h3 l1 -8z M22 12 l1 9 h3 l-1 -9z" fill="#8a5d2c"/><path d="M3 8 q0 -6 8 -6 h11 q5 -1 7 -7 l6 1 q-1 8 -3 14 q-1 5 -6 6 h-17 q-6 0 -6 -8z" fill="#b5874a"/><path d="M8 14 q8 3 18 0" fill="none" stroke="#e0c08a" stroke-width="2"/><path d="M9 13 l0 8 h3 l1 -8z M25 13 l1 8 h3 l-1 -8z" fill="#b5874a"/><ellipse cx="31" cy="-5" rx="6" ry="5" fill="#b5874a"/><path d="M35 -8 q6 0 7 3 q0 3 -4 3 h-4z" fill="#c9a06a"/><circle cx="41.5" cy="-5.5" r="1.4" fill="#111"/><circle cx="33" cy="-7" r="1" fill="#111"/><path d="M28 -10 q-5 2 -3 10 q3 -1 5 -7z" fill="#6e4a22"/><path d="M27 1 q4 2 8 0" fill="none" stroke="#a8323a" stroke-width="1.5"/></g>`;
  if (h("velo")) s += `<g transform="translate(350 190)" fill="none" stroke="#1f4e8a" stroke-width="2.5"><circle cx="8" cy="14" r="9"/><circle cx="38" cy="14" r="9"/><path d="M8 14 l12 -14 h14 l4 14 M20 0 l8 14 h-20 M34 0 l-2 -6 h-5"/></g>`;
  if (h("voiture")) {
    // Voiture d'époque (type Ford T, années 1920) : capote en toile, carrosserie haute,
    // roues à rayons en bois, garde-boue noirs, marchepied, radiateur et phare en laiton.
    const wheel = cx => `<circle cx="${cx}" cy="38.5" r="13" fill="#ead9aa" stroke="#1c1c1c" stroke-width="3"/>` +
      [0, 30, 60, 90, 120, 150].map(a => { const dx = (10 * Math.cos(a * Math.PI / 180)).toFixed(1), dy = (10 * Math.sin(a * Math.PI / 180)).toFixed(1);
        return `<line x1="${cx - dx}" y1="${(38.5 - dy).toFixed(1)}" x2="${(cx + +dx).toFixed(1)}" y2="${(38.5 + +dy).toFixed(1)}" stroke="#8a5a2b" stroke-width="1.1"/>`; }).join("") +
      `<circle cx="${cx}" cy="38.5" r="2.6" fill="#c99a2e"/>`;
    s += `<g transform="translate(12 166) scale(0.9)">
      <rect x="3" y="1" width="60" height="5" rx="2.5" fill="#1c1c1c"/>
      <line x1="7" y1="6" x2="7" y2="13" stroke="#1c1c1c" stroke-width="2.5"/><line x1="59" y1="6" x2="59" y2="13" stroke="#1c1c1c" stroke-width="2.5"/>
      <rect x="5" y="12" width="56" height="26" rx="3" fill="#7b1e24"/>
      <rect x="11" y="14" width="20" height="9" fill="#bfe3f0" stroke="#4a1216" stroke-width="1.5"/>
      <rect x="36" y="14" width="19" height="9" fill="#bfe3f0" stroke="#4a1216" stroke-width="1.5"/>
      <line x1="33.5" y1="12" x2="33.5" y2="38" stroke="#4a1216" stroke-width="1.5"/><circle cx="31.5" cy="29" r="1.2" fill="#c99a2e"/>
      <path d="M60 8 l5 -1 v16 h-5z" fill="#bfe3f0" stroke="#c99a2e" stroke-width="1.5"/>
      <path d="M61 25 h42 v13 h-42z" fill="#7b1e24"/><line x1="61" y1="25" x2="103" y2="25" stroke="#4a1216" stroke-width="2"/>
      ${[68, 73, 78].map(x => `<line x1="${x}" y1="28" x2="${x}" y2="34" stroke="#4a1216" stroke-width="1.4"/>`).join("")}
      <rect x="103" y="19" width="7" height="19" rx="1.5" fill="#c99a2e"/><line x1="106.5" y1="21" x2="106.5" y2="36" stroke="#8a6a1e" stroke-width="1"/>
      <circle cx="100" cy="17" r="4" fill="#c99a2e"/><circle cx="100" cy="17" r="2.3" fill="#fff6c0"/><rect x="97" y="20" width="6" height="2" fill="#1c1c1c"/>
      <rect x="9" y="39" width="94" height="3" fill="#1c1c1c"/>
      ${wheel(23)}${wheel(88)}
      <path d="M7 40 A16 16 0 0 1 39 40" fill="none" stroke="#1c1c1c" stroke-width="3.2"/>
      <path d="M72 40 A16 16 0 0 1 104 40" fill="none" stroke="#1c1c1c" stroke-width="3.2"/>
    </g>`;
  }
  if (h("fleurs")) s += [...Array(16)].map((_, k) => `<line x1="${142 + k * 12}" y1="216" x2="${142 + k * 12}" y2="206" stroke="#2e7d32" stroke-width="2"/><circle cx="${142 + k * 12}" cy="204" r="4" fill="${["#e2563d", "#f2c94c", "#d36ac2", "#ffffff"][k % 4]}"/>`).join("");
  return s + "</svg>";
}

/* Professeur seul (petit portrait pour les énigmes). */
function drawPortrait(equipped){
  return `<svg viewBox="140 50 120 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${drawProfessor(equipped)}</svg>`;
}

if (typeof module !== "undefined") module.exports = { ITEMS, SLOT_NAMES, DECOR_SLOTS, drawScene, drawGarden, drawPortrait };
