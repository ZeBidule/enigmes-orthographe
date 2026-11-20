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
   Le jardin change de saison chaque semaine (4 saisons en rotation) et un élément
   différent (parmi 30) traverse le ciel chaque jour.
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

/* Assombrit (k < 1) ou éclaircit (k > 1) une couleur #rrggbb. */
function shade(hex, k){
  const n = parseInt(hex.slice(1), 16);
  const c = v => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0");
  return "#" + c(n >> 16) + c((n >> 8) & 255) + c(n & 255);
}

/* ---------- Calendrier : saison de la semaine, élément du ciel du jour ---------- */
const SEASONS = ["printemps", "ete", "automne", "hiver"];
const SEASON_NAMES = { printemps:"Printemps", ete:"Été", automne:"Automne", hiver:"Hiver" };
const SKY_NAMES = [
  "Un nuage", "Des oiseaux", "Un arc-en-ciel", "La lune", "Un avion", "Un cerf-volant", "Un papillon",
  "Une étoile filante", "Un dirigeable", "Une soucoupe volante", "Un hélicoptère", "Des oies sauvages",
  "Un parachutiste", "Une fusée", "Un nuage en cœur", "Une comète", "Un feu d'artifice", "Une hirondelle",
  "Un ballon rouge", "Un satellite", "Un drone", "Un orage", "Une cigogne", "Saturne",
  "Le traîneau du Père Noël", "Un avion en papier", "Un nuage de pluie", "Un aigle", "Une mouette",
  "L'étoile du soir"
];
function dayNumber(d){ return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
/* Semaine du lundi au dimanche (le 1er janvier 1970 était un jeudi). */
function seasonOf(date){ return SEASONS[Math.floor((dayNumber(date || new Date()) + 3) / 7) % 4]; }
function skyIndexOf(date){ return dayNumber(date || new Date()) % 30; }

/* Palettes du jardin par saison. */
const PAL = {
  printemps: { skyT:"#8fd0f5", skyB:"#e4f6ff", hill:"#a5d57a", hill2:"#8cc562", grass:"#74bd4a", grass2:"#68ad40", leaf:"#6dbb4a", leaf2:"#58a43b", path:"#e0cfa0", roof:"#a8323a", sun:"#ffe27a", far:"#7fb35a" },
  ete:       { skyT:"#1b86e6", skyB:"#8ccfff", hill:"#78b84e", hill2:"#5fa23c", grass:"#5aa83a", grass2:"#4c962f", leaf:"#3e8e3a", leaf2:"#2f7a2e", path:"#dcc48c", roof:"#a8323a", sun:"#ffd84a", far:"#4f9440" },
  automne:   { skyT:"#a9bfd3", skyB:"#f3e6d2", hill:"#c2a64a", hill2:"#a98a3a", grass:"#a8a246", grass2:"#968d3c", leaf:"#d9822b", leaf2:"#b8501f", path:"#cdb585", roof:"#8c3a22", sun:"#f6d68a", far:"#b0803a" },
  hiver:     { skyT:"#aebfd2", skyB:"#eef3f8", hill:"#e6eef5", hill2:"#d5e1ec", grass:"#f2f6fa", grass2:"#dfe8f1", leaf:"#8a6a4a", leaf2:"#5a4630", path:"#cfd8e2", roof:"#7a2a30", sun:"#f8f2d0", far:"#c4d1dc" }
};

/* ---------- Maison (décor, derrière le professeur) ---------- */
function drawHome(owned, season){
  const h = id => owned.includes(id);
  const P = PAL[season || "printemps"], winter = season === "hiver";
  let s = "";
  // Mur papier peint, boiserie, corniche, plinthe
  s += `<rect width="400" height="210" fill="#e9d8b4"/>
        <rect width="400" height="210" fill="url(#wall)"/>
        <rect width="400" height="8" fill="#f6ecd2"/><rect y="8" width="400" height="3" fill="#c9b27c"/>
        <rect y="150" width="400" height="50" fill="#b98a52"/>
        ${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${10+i*50}" y="158" width="38" height="34" fill="none" stroke="#8a6034" stroke-width="2"/><rect x="${13+i*50}" y="161" width="32" height="28" fill="#c79a62" opacity=".5"/>`).join("")}
        <rect y="146" width="400" height="6" fill="#d8b27a"/><rect y="150" width="400" height="2" fill="#8a6034"/>
        <rect y="200" width="400" height="10" fill="#6b4220"/><rect y="200" width="400" height="2" fill="#a07040"/>
        <rect y="210" width="400" height="90" fill="#a0703f"/>
        ${[0,1,2,3,4,5,6,7].map(i=>`<line x1="${i*55}" y1="210" x2="${i*55-30}" y2="300" stroke="#8a5d32"/>`).join("")}
        ${[232,256,280].map((y,i)=>`<line x1="0" y1="${y}" x2="400" y2="${y}" stroke="#8a5d32" stroke-opacity="${.5-i*.1}"/>`).join("")}
        <rect y="210" width="400" height="90" fill="url(#floorshade)"/>`;
  // Fenêtre : vue sur le jardin de la saison
  s += `<rect x="244" y="24" width="92" height="92" fill="#5a3a1a"/>
        <rect x="250" y="30" width="80" height="80" fill="${P.skyB}"/>
        <rect x="250" y="30" width="80" height="40" fill="${P.skyT}" opacity=".6"/>
        <path d="M250 92 q20 -12 40 -4 q20 -8 40 2 v20 h-80z" fill="${P.hill}"/>
        <path d="M250 100 h80 v10 h-80z" fill="${P.grass}"/>
        ${winter ? `<path d="M250 92 q20 -12 40 -4 q20 -8 40 2" fill="none" stroke="#fff" stroke-width="3"/>` : `<circle cx="276" cy="94" r="5" fill="${P.leaf}"/><rect x="275" y="96" width="2" height="8" fill="#6b3f1d"/>`}
        <circle cx="312" cy="48" r="8" fill="${P.sun}"/>
        <line x1="290" y1="30" x2="290" y2="110" stroke="#5a3a1a" stroke-width="4"/>
        <line x1="250" y1="70" x2="330" y2="70" stroke="#5a3a1a" stroke-width="4"/>
        <rect x="250" y="30" width="80" height="80" fill="none" stroke="#7a5230" stroke-width="2"/>
        <path d="M254 34 l14 0 l-14 14z" fill="#fff" opacity=".35"/>
        <rect x="238" y="114" width="104" height="8" rx="2" fill="#7a5230"/><rect x="238" y="114" width="104" height="2" fill="#a07040"/>`;
  if (h("rideaux")) s += `<rect x="232" y="14" width="116" height="10" rx="3" fill="#5a3a1a"/><circle cx="232" cy="19" r="4" fill="#c99a2e"/><circle cx="348" cy="19" r="4" fill="#c99a2e"/>
    <path d="M238 24 h26 q-8 30 -3 62 q4 22 -6 40 h-20 q-4 -62 3 -102z" fill="#a8323a"/>
    <path d="M342 24 h-26 q8 30 3 62 q-4 22 6 40 h20 q4 -62 -3 -102z" fill="#a8323a"/>
    <path d="M246 26 q-4 50 0 98 M254 26 q-3 40 0 86 M334 26 q4 50 0 98 M326 26 q3 40 0 86" fill="none" stroke="#7a1f26" stroke-width="1.6" opacity=".7"/>
    <path d="M258 28 q-3 30 1 56" fill="none" stroke="#d65a62" stroke-width="1.5" opacity=".6"/><path d="M322 28 q3 30 -1 56" fill="none" stroke="#d65a62" stroke-width="1.5" opacity=".6"/>
    <path d="M240 88 q12 6 24 0 M340 88 q-12 6 -24 0" fill="none" stroke="#c99a2e" stroke-width="3"/><circle cx="240" cy="88" r="3" fill="#c99a2e"/><circle cx="340" cy="88" r="3" fill="#c99a2e"/>
    <path d="M232 24 h116 q-4 8 -10 4 q-6 6 -12 0 q-6 6 -12 0 q-6 6 -12 0 q-6 6 -12 0 q-6 6 -12 0 q-6 6 -12 0 q-6 6 -12 0 q-6 6 -12 0 q-6 4 -12 0z" fill="#8a2430"/>`;
  if (h("tableau")) s += `<line x1="147" y1="14" x2="132" y2="40" stroke="#3b2412" stroke-width="1"/><line x1="147" y1="14" x2="162" y2="40" stroke="#3b2412" stroke-width="1"/>
    <rect x="116" y="38" width="62" height="52" rx="2" fill="#a87a1e"/><rect x="119" y="41" width="56" height="46" fill="#e0b84a"/><rect x="121" y="43" width="52" height="42" fill="#7a5412"/>
    <rect x="124" y="46" width="46" height="36" fill="#9fd0ec"/><path d="M124 70 q10 -14 22 -6 q10 -10 24 4 v14 h-46z" fill="#5d9a5a"/><path d="M124 76 q12 -6 24 -2 q12 -4 22 2 v8 h-46z" fill="#3e7a48"/>
    <ellipse cx="148" cy="79" rx="12" ry="2.5" fill="#6fb0d8"/><circle cx="160" cy="54" r="5" fill="#ffe08a"/><path d="M130 62 q4 -8 8 0 q4 -6 8 1" fill="none" stroke="#fff" stroke-width="2"/>`;
  if (h("lustre")) s += `<ellipse cx="200" cy="30" rx="70" ry="34" fill="url(#lustreglow)"/>
    <line x1="200" y1="0" x2="200" y2="14" stroke="#5a3a1a" stroke-width="2"/><rect x="194" y="0" width="12" height="4" fill="#c99a2e"/>
    <path d="M200 14 v12 M200 20 q-18 0 -26 10 M200 20 q18 0 26 10 M200 20 q-8 0 -12 8 M200 20 q8 0 12 8" fill="none" stroke="#c99a2e" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="200" cy="22" r="4" fill="#c99a2e"/><path d="M194 28 h12 l-3 10 h-6z" fill="#e0b84a"/>
    ${[174,188,212,226].map((x,i)=>`<rect x="${x-2}" y="${i%3===0?24:22}" width="4" height="8" fill="#fff6e0"/><path d="M${x} ${i%3===0?18:16} q-3 4 0 6 q3 -2 0 -6z" fill="#ffb020"/><path d="M${x-4} 32 h8 l-1.5 3 h-5z" fill="#c99a2e"/>`).join("")}
    ${[[178,38],[190,42],[200,46],[210,42],[222,38]].map(([x,y])=>`<path d="M${x} ${y-4} l3 4 l-3 5 l-3 -5z" fill="#dff3ff" stroke="#9fc8e0" stroke-width=".6"/>`).join("")}`;
  if (h("biblio")) {
    s += `<rect x="8" y="54" width="94" height="196" fill="#4a2a12"/><rect x="12" y="58" width="86" height="188" fill="#6b3f1d"/><rect x="6" y="50" width="98" height="8" fill="#7a4a22"/><rect x="6" y="50" width="98" height="2" fill="#a07040"/>`;
    [66,108,150,192].forEach((y,r)=>{
      s += `<rect x="16" y="${y}" width="78" height="38" fill="#3a200d"/><rect x="16" y="${y+38}" width="78" height="4" fill="#8a5a2b"/>`;
      let x = 18; const cols = ["#a8323a","#2c4a8a","#2e7d32","#c99a2e","#6a2c8a","#8a5a2b","#1f6a6a","#c0612a"];
      for (let i = 0; i < 9; i++) {
        const w = 6 + ((i * 5 + r * 3) % 5), ht = 24 + ((i * 7 + r * 5) % 12);
        if (x + w > 92) break;
        const c = cols[(i + r * 3) % cols.length];
        s += `<rect x="${x}" y="${y+38-ht}" width="${w}" height="${ht}" fill="${c}"/><rect x="${x}" y="${y+38-ht}" width="1.5" height="${ht}" fill="#ffffff44"/><rect x="${x}" y="${y+38-ht+4}" width="${w}" height="1.6" fill="#e8c860"/><rect x="${x}" y="${y+34}" width="${w}" height="1.6" fill="#e8c860"/>`;
        x += w + 1;
      }
    });
    s += `<circle cx="84" cy="48" r="0" fill="none"/>`;
  }
  if (h("horloge")) s += `<rect x="342" y="236" width="48" height="12" fill="#4a2a12"/><rect x="346" y="228" width="40" height="10" fill="#5a3418"/>
    <rect x="350" y="132" width="32" height="100" fill="#6b3f1d"/><rect x="350" y="132" width="4" height="100" fill="#8a5a2b"/>
    <rect x="346" y="92" width="40" height="44" fill="#7a4a22"/><rect x="343" y="88" width="46" height="5" rx="1.2" fill="#5a3418"/><rect x="345" y="85" width="42" height="3.4" fill="#8a5a2b"/>
    <path d="M347 85 q0 -15 19 -15 q19 0 19 15z" fill="#7a4a22"/><path d="M352 85 q0 -10 14 -10 q14 0 14 10z" fill="#5a3418"/><path d="M355 82 q2 -5.6 11 -5.8" fill="none" stroke="#a07040" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M366 71 v-9" stroke="#c99a2e" stroke-width="2.2"/><circle cx="366" cy="60" r="3.6" fill="#e0b84a" stroke="#a87a1e" stroke-width=".8"/><circle cx="365" cy="59" r="1" fill="#fff6c0"/>
    ${[348,384].map(x=>`<path d="M${x} 85 v-5" stroke="#c99a2e" stroke-width="1.6"/><circle cx="${x}" cy="78.6" r="2.2" fill="#e0b84a" stroke="#a87a1e" stroke-width=".6"/>`).join("")}
    <circle cx="366" cy="110" r="15" fill="#fff8e0" stroke="#c99a2e" stroke-width="3"/>
    ${[...Array(12)].map((_,i)=>{const a=i*Math.PI/6,x1=(366+12*Math.sin(a)).toFixed(1),y1=(110-12*Math.cos(a)).toFixed(1),x2=(366+14*Math.sin(a)).toFixed(1),y2=(110-14*Math.cos(a)).toFixed(1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3b2412" stroke-width="${i%3===0?1.6:.8}"/>`;}).join("")}
    <line x1="366" y1="110" x2="366" y2="99" stroke="#000" stroke-width="2" stroke-linecap="round"/><line x1="366" y1="110" x2="374" y2="114" stroke="#000" stroke-width="1.6" stroke-linecap="round"/><circle cx="366" cy="110" r="1.6" fill="#c99a2e"/>
    <rect x="356" y="142" width="20" height="74" rx="2" fill="#2a1608"/><rect x="358" y="144" width="16" height="70" fill="#3b2412"/>
    <line x1="366" y1="146" x2="366" y2="196" stroke="#c99a2e" stroke-width="1.6"/><circle cx="366" cy="198" r="7" fill="#e0b84a" stroke="#a87a1e" stroke-width="1.5"/><circle cx="364" cy="196" r="2" fill="#fff6c0"/>`;
  if (h("lampe")) s += `<ellipse cx="320" cy="150" rx="34" ry="12" fill="url(#lampglow)"/>
    <ellipse cx="321" cy="254" rx="22" ry="5" fill="#000" opacity=".22"/>
    <ellipse cx="320" cy="251" rx="19" ry="5.4" fill="#2a1608"/><ellipse cx="320" cy="249" rx="19" ry="5" fill="#4a2a12"/><ellipse cx="320" cy="248.4" rx="14" ry="3.4" fill="#6b3f1d"/><ellipse cx="320" cy="247.6" rx="10" ry="2.4" fill="none" stroke="#c99a2e" stroke-width="1.2"/>
    <path d="M312 247 q-1 -11 8 -11 q9 0 8 11 q-8 3 -16 0z" fill="#5a3a1a"/><path d="M314 244 q0 -6 4 -7" fill="none" stroke="#a07040" stroke-width="1.4" stroke-linecap="round"/>
    <rect x="316.4" y="233" width="7.2" height="3" rx="1.2" fill="#c99a2e"/><line x1="320" y1="150" x2="320" y2="234" stroke="#5a3a1a" stroke-width="3.6"/><line x1="318.9" y1="152" x2="318.9" y2="232" stroke="#8a5a2b" stroke-width="1" opacity=".8"/>
    <ellipse cx="320" cy="214" rx="4.4" ry="3.4" fill="#c99a2e"/><ellipse cx="319" cy="213" rx="1.4" ry="1" fill="#fff6c0"/><rect x="316.6" y="190" width="6.8" height="2.4" rx="1" fill="#c99a2e"/><ellipse cx="320" cy="178" rx="3.6" ry="3" fill="#c99a2e"/><ellipse cx="319" cy="177" rx="1.2" ry=".9" fill="#fff6c0"/>
    <path d="M300 152 h40 l-10 -32 h-20z" fill="#f2c94c"/><path d="M300 152 h40 l-2 -6 h-36z" fill="#d8a82a"/><path d="M310 150 l4 -28 M320 150 v-30 M330 150 l-4 -28" stroke="#c99a2e" stroke-width=".8" opacity=".7"/><rect x="316" y="116" width="8" height="5" fill="#c99a2e"/>`;
  if (h("tapis")) {
    s += `<ellipse cx="200" cy="281" rx="116" ry="19" fill="#4a1010" opacity=".55"/><ellipse cx="200" cy="278" rx="112" ry="18" fill="#7a2424"/>
    <ellipse cx="200" cy="278" rx="100" ry="14.5" fill="none" stroke="#e0b050" stroke-width="2.4"/><ellipse cx="200" cy="278" rx="90" ry="11.5" fill="#a33a3a"/>
    <ellipse cx="200" cy="278" rx="82" ry="10" fill="none" stroke="#e0b050" stroke-width="1" stroke-dasharray="5 3"/>
    ${[-58,-38,-19,0,19,38,58].map((dx,i)=>`<path d="M${200+dx} 278 l5 -4 l5 4 l-5 4z" fill="${i%2?"#e0b050":"#1f3a6a"}"/>`).join("")}`;
  }
  if (h("globe")) s += `<g stroke="#3b2412" stroke-width="1"><path d="M273 228 l-22 22 h5 l19 -17 l19 17 h5z" fill="#6b3f1d"/><rect x="270" y="200" width="6" height="30" fill="#7a4a22"/><ellipse cx="273" cy="212" rx="5" ry="3" fill="#8a5a2b"/><ellipse cx="273" cy="226" rx="6" ry="3" fill="#8a5a2b"/></g><circle cx="273" cy="168" r="24" fill="#e8d5a3" stroke="#8a6a3a" stroke-width="1"/><path d="M258 156 q8 -8 16 -2 q2 8 -6 10 q-2 8 -8 4 q-6 -4 -2 -12z M276 168 q8 -4 12 4 q-2 10 -10 12 q-4 -6 -2 -16z M262 178 q4 2 4 8 q-4 0 -6 -4z" fill="#9a7444" opacity=".85"/><g fill="none" stroke="#a88a5a" stroke-width=".6"><ellipse cx="273" cy="168" rx="10" ry="24"/><ellipse cx="273" cy="168" rx="24" ry="8"/><line x1="249" y1="168" x2="297" y2="168"/></g><circle cx="273" cy="168" r="28" fill="none" stroke="#c99a2e" stroke-width="3"/><ellipse cx="273" cy="172" rx="31" ry="6" fill="none" stroke="#a87a1e" stroke-width="3"/><line x1="273" y1="196" x2="273" y2="202" stroke="#c99a2e" stroke-width="3"/><circle cx="273" cy="139" r="2.5" fill="#c99a2e"/>`;
  if (h("plante")) s += `<ellipse cx="123" cy="252" rx="19" ry="4" fill="#8a4a18"/><path d="M106 224 h34 l-4 26 h-26z" fill="#b5651d"/><rect x="104" y="222" width="38" height="6" rx="2" fill="#c97a30"/><path d="M110 232 h26" stroke="#8a4a18" stroke-width="1.2"/>
    <path d="M123 224 q-2 -22 -2 -42 M123 224 q-14 -14 -26 -26 M123 224 q14 -14 26 -26 M123 224 q-8 -26 -16 -44 M123 224 q8 -26 16 -44" fill="none" stroke="#2e6a2a" stroke-width="2"/>
    ${[[121,178,-4,0],[96,194,-60,1],[150,194,60,0],[106,172,-24,1],[140,172,24,0],[104,208,-70,0],[142,208,70,1]].map(([x,y,r,v])=>`<g transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="8" ry="15" fill="${v?"#2e7d32":"#3e9a3e"}"/><path d="M${x} ${y-13} v26" stroke="#1f5a22" stroke-width="1"/></g>`).join("")}`;
  return s;
}

/* Mains simples façon émoji : silhouette arrondie d'une seule couleur (contour puis remplissage). */
function handShape(shapes){
  return shapes.map(([x, y, w, h, r]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#c48b52" stroke="#c48b52" stroke-width="1.8" stroke-linejoin="round"/>`).join("")
    + shapes.map(([x, y, w, h, r]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${SKIN}"/>`).join("");
}
function fist(x, y){
  const thumb = `<g transform="rotate(-18 ${x + 1} ${y + 3})">${handShape([[x - 3.4, y + 1.4, 7.4, 3.8, 1.9]])}</g>`;
  return handShape([[x, y, 12, 16, 5.2]])
    + `<path d="M${x + 2} ${y + 5.4} h9.4 M${x + 2} ${y + 9.2} h9.4 M${x + 2} ${y + 13} h8.4" stroke="#c48b52" stroke-width=".9" stroke-linecap="round"/>`
    + `<path d="M${x + 4} ${y + 2} q3.6 -1.8 7 0" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".45"/>` + thumb;
}

/* ---------- Professeur : ancienne version (avant les améliorations), choisie par le bouton de la boutique ---------- */
function drawProfessorClassic(eq){
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

/* Style du personnage : "modern" (par défaut) ou "classic" (ancien dessin), mémorisé dans le navigateur. */
const STYLE_KEY = "plume-style";
let CHAR_STYLE = "modern";
try { if (typeof localStorage !== "undefined" && localStorage.getItem(STYLE_KEY) === "classic") CHAR_STYLE = "classic"; } catch (e) {}
function getCharStyle(){ return CHAR_STYLE; }
function setCharStyle(v){
  CHAR_STYLE = v === "classic" ? "classic" : "modern";
  try { if (typeof localStorage !== "undefined") localStorage.setItem(STYLE_KEY, CHAR_STYLE); } catch (e) {}
  return CHAR_STYLE;
}
function drawProfessor(eq){ return CHAR_STYLE === "classic" ? drawProfessorClassic(eq) : drawProfessorModern(eq); }

/* ---------- Professeur ---------- */
function drawProfessorModern(eq){
  const coat = COAT_COLORS[eq.coat || "none"], dk = shade(coat, .72), lt = shade(coat, 1.25);
  let s = "";
  // Cape (derrière le corps)
  if (eq.coat === "cape") s += `<path d="M170 158 L142 266 q58 10 116 0 L230 158z" fill="#4a1c62"/><path d="M170 158 L142 266 q20 4 40 6 L184 166z" fill="#3a1450"/><path d="M230 158 L258 266 q-20 4 -40 6 L216 166z" fill="#56226f"/>`;
  // Jambes et chaussures
  s += `<rect x="184" y="238" width="13" height="40" fill="#3b2a20"/><rect x="203" y="238" width="13" height="40" fill="#3b2a20"/>
        <rect x="184" y="238" width="3" height="40" fill="#52392a"/><rect x="203" y="238" width="3" height="40" fill="#52392a"/>
        <path d="M174 284 q0 -8 12 -8 h10 v8z M226 284 q0 -8 -12 -8 h-10 v8z" fill="#1a1a1a"/><ellipse cx="187" cy="283" rx="13" ry="5" fill="#111"/><ellipse cx="213" cy="283" rx="13" ry="5" fill="#111"/><path d="M178 281 q8 -3 16 0 M206 281 q8 -3 16 0" stroke="#555" stroke-width="1" fill="none"/>`;
  // Épaules arrondies (sous le corps)
  s += `<path d="M164 170 q-2 -13 14 -14 h44 q16 1 14 14 l-3 6 h-66z" fill="${coat}"/>
        <path d="M166 166 q2 -9 14 -9 h14 q-12 4 -20 14z" fill="${lt}" opacity=".35"/><path d="M234 166 q-2 -9 -14 -9 h-14 q12 4 20 14z" fill="${dk}" opacity=".25"/>
        <path d="M176 158 q-8 6 -10 16 M224 158 q8 6 10 16" fill="none" stroke="${dk}" stroke-width="1.4" opacity=".7"/>`;
  // Corps (veste)
  s += `<path d="M172 158 h56 l12 88 h-80z" fill="${coat}"/>
        <path d="M172 158 h8 l-6 88 h-6z" fill="${dk}" opacity=".5"/><path d="M220 158 h8 l12 88 h-6z" fill="${lt}" opacity=".25"/>
        <path d="M192 158 h16 l-8 34z" fill="#fff"/><path d="M200 164 v24" stroke="#d8d8d8" stroke-width="1"/>
        <path d="M182 158 l18 34 l-8 -34z M218 158 l-18 34 l8 -34z" fill="${dk}"/>
        <path d="M240 246 h-80 q40 6 80 0z" fill="${dk}"/>
        <line x1="200" y1="192" x2="200" y2="246" stroke="#00000033" stroke-width="2"/>
        ${[200,214,228].map(y=>`<circle cx="204" cy="${y}" r="2.4" fill="#c99a2e"/><circle cx="203.4" cy="${y-.6}" r=".8" fill="#fff6c0"/>`).join("")}
        <path d="M178 206 h12 v8 h-12z" fill="${dk}" opacity=".7"/><path d="M180 206 l3 -4 l3 4z" fill="#fff" opacity=".9"/>`;
  if (eq.coat === "tweed") s += `<path d="M176 172 l6 -4 l6 4 l6 -4 M178 188 l6 -4 l6 4 l6 -4 M218 172 l6 -4 M174 204 l6 -4 l6 4 M214 190 l6 -4 l6 4 M176 222 l6 -4 l6 4 l6 -4 M212 210 l6 -4 l6 4 M170 238 l6 -4 l6 4 M216 230 l6 -4 l6 4" fill="none" stroke="#5a3a18" stroke-width="1.2"/><rect x="176" y="198" width="12" height="3" fill="#c99a2e" opacity="0"/>`;
  if (eq.coat === "bleue") s += `<path d="M172 244 l-6 22 q10 4 20 0 l4 -22z M228 244 l6 22 q-10 4 -20 0 l-4 -22z" fill="${coat}"/><path d="M200 192 v54 M193 200 h14 M193 220 h14" stroke="#1c3266" stroke-width="1.4"/><path d="M178 158 l22 26 l22 -26" fill="none" stroke="#c99a2e" stroke-width="1.2"/>`;
  // Bras (manches arrondies, poignets, mains avec doigts) : gauche dessiné, droit en miroir
  const sleeve = `<path d="M180 157 q-17 0 -20 14 q-6 22 -10 52 l18 3 q2 -26 13 -43z" fill="${coat}"/>
        <path d="M180 157 q-17 0 -20 14 q-3 10 -5 24 q9 -6 14 -15 q4 -9 11 -23z" fill="${lt}" opacity=".32"/>
        <path d="M177 172 q-7 8 -9 26 q-2 12 -3 24" fill="none" stroke="${dk}" stroke-width="2" opacity=".55"/>
        <path d="M151 217 l19 4 l-1.4 8 l-19 -4z" fill="#fff" stroke="#d0d0d0" stroke-width=".7"/><circle cx="163" cy="224" r="1.4" fill="#c99a2e"/>`;
  const openHand = handShape([[153.8, 228, 12.4, 10, 4.4], [153.6, 234.6, 2.7, 8, 1.35], [156.6, 234.6, 2.7, 10.4, 1.35], [159.6, 234.6, 2.7, 11.4, 1.35], [162.6, 234.6, 2.7, 9, 1.35]])
    + `<g transform="rotate(-26 165 231)">${handShape([[164.4, 229, 3.1, 8, 1.55]])}</g>`;
  s += `<g>${sleeve}<g transform="rotate(11 160 226)">${openHand}</g></g><g transform="translate(400 0) scale(-1 1)">${sleeve}${eq.hand ? "" : `<g transform="rotate(11 160 226)">${openHand}</g>`}</g>`;
  // Cou
  s += `<path d="M190 154 h20 l-4 8 h-12z" fill="#fff"/>`;
  if (eq.neck === "noeud") s += `<path d="M200 164 l-14 -8 q-3 8 0 16z M200 164 l14 -8 q3 8 0 16z" fill="#c0343e"/><path d="M200 164 l-14 -8 v4 l12 5z" fill="#e0606a" opacity=".7"/><circle cx="200" cy="164" r="3.6" fill="#8a1f26"/><circle cx="199" cy="163" r="1" fill="#e0606a"/>`;
  if (eq.neck === "echarpe") s += `<path d="M178 154 q22 14 44 0 v11 q-22 14 -44 0z" fill="#c62828"/><path d="M180 158 q20 10 40 0 M180 162 q20 10 40 0" fill="none" stroke="#ffd2cc" stroke-width="1.4" opacity=".8"/><path d="M211 162 l10 40 l-12 3 l-8 -40z" fill="#b01e1e"/><path d="M213 168 l7 28 M210 172 l6 26" stroke="#ffd2cc" stroke-width="1.2" opacity=".7"/><path d="M209 205 l-2 8 M213 204 l-1 9 M217 203 l0 9 M221 201 l1 9" stroke="#b01e1e" stroke-width="1.6"/>`;
  // Tête
  s += `<rect x="194" y="148" width="12" height="12" fill="${SKIN}"/><rect x="194" y="148" width="12" height="4" fill="#c48b52" opacity=".5"/>
        <circle cx="200" cy="128" r="27" fill="${SKIN}"/>
        <path d="M178 140 q22 22 44 0 q4 14 -22 20 q-26 -6 -22 -20z" fill="${SKIN}" opacity="0"/>
        <ellipse cx="190" cy="138" rx="7" ry="3.5" fill="#f2a18a" opacity=".45"/><ellipse cx="210" cy="138" rx="7" ry="3.5" fill="#f2a18a" opacity=".45"/>
        <path d="M173 124 q-2 -26 27 -28 q29 2 27 28 q-4 -12 -10 -14 q-17 6 -34 0 q-6 2 -10 14z" fill="#d8d8d8"/><path d="M180 110 q10 -8 22 -8 M190 106 q10 -4 18 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="172" cy="130" rx="4" ry="7" fill="${SKIN}"/><ellipse cx="228" cy="130" rx="4" ry="7" fill="${SKIN}"/><path d="M171 128 q2 3 0 5 M229 128 q-2 3 0 5" stroke="#c48b52" fill="none"/>
        <ellipse cx="190" cy="126" rx="4.5" ry="3.6" fill="#fff"/><ellipse cx="210" cy="126" rx="4.5" ry="3.6" fill="#fff"/>
        <circle cx="190.5" cy="126.5" r="2.7" fill="#3a5a8a"/><circle cx="210.5" cy="126.5" r="2.7" fill="#3a5a8a"/><circle cx="190.5" cy="126.5" r="1.4" fill="#111"/><circle cx="210.5" cy="126.5" r="1.4" fill="#111"/><circle cx="191.4" cy="125.5" r=".7" fill="#fff"/><circle cx="211.4" cy="125.5" r=".7" fill="#fff"/>
        <path d="M184 118 q6 -4 12 -1 M204 117 q6 -3 12 1" stroke="#9a9a9a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M200 129 q-4 4 -4 8 q4 3 8 0" fill="none" stroke="#c48b52" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M200 141 q-9 -5 -20 5 q10 -1 20 -2 q10 1 20 2 q-11 -10 -20 -5z" fill="#b8b8b8"/><path d="M186 144 q8 -2 14 0 q6 -2 14 0" fill="none" stroke="#fff" stroke-width="1" opacity=".7"/>
        <path d="M193 148 q7 4 14 0" fill="none" stroke="#8a4a3a" stroke-width="2" stroke-linecap="round"/>`;
  // Visage
  if (eq.face === "lunettes") s += `<circle cx="190" cy="126" r="8.5" fill="#cfe8ff44" stroke="#2a2a2a" stroke-width="2"/><circle cx="210" cy="126" r="8.5" fill="#cfe8ff44" stroke="#2a2a2a" stroke-width="2"/><path d="M198.5 125 q1.5 -2 3 0" fill="none" stroke="#2a2a2a" stroke-width="2"/><path d="M181.5 125 l-8 -2 M218.5 125 l8 -2" stroke="#2a2a2a" stroke-width="1.6"/><path d="M185 121 q3 -3 7 -2 M205 121 q3 -3 7 -2" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`;
  if (eq.face === "monocle") s += `<circle cx="210" cy="126" r="9" fill="#ffffff44" stroke="#c99a2e" stroke-width="2.6"/><circle cx="210" cy="126" r="9" fill="none" stroke="#fff6c0" stroke-width=".8" stroke-dasharray="6 40"/><path d="M206 121 q3 -3 7 -2" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><path d="M217 132 q8 18 -2 32" fill="none" stroke="#c99a2e" stroke-width="1.4" stroke-dasharray="2 1.4"/><circle cx="215" cy="164" r="2" fill="#c99a2e"/>`;
  // Chapeaux
  if (eq.hat === "beret") s += `<path d="M172 108 q-4 -16 14 -22 q24 -8 40 6 q8 8 -2 16 q-26 8 -48 2 q-4 -1 -4 -2z" fill="#2f3a7a"/><path d="M182 96 q14 -8 30 -4" fill="none" stroke="#4a58a8" stroke-width="2.4" stroke-linecap="round"/><path d="M176 108 q24 6 48 -2" fill="none" stroke="#1a2050" stroke-width="3"/><path d="M206 88 q0 -7 5 -7" fill="none" stroke="#1a2050" stroke-width="3" stroke-linecap="round"/>`;
  if (eq.hat === "melon") s += `<ellipse cx="200" cy="107" rx="37" ry="6.5" fill="#1a1a1a"/><path d="M176 107 q0 -34 24 -34 q24 0 24 34z" fill="#2a2a2a"/><path d="M182 98 q2 -20 14 -22" fill="none" stroke="#5a5a5a" stroke-width="2.4" stroke-linecap="round"/><path d="M176 104 h48 l1 5 h-50z" fill="#7a2a2a"/><path d="M164 106 q36 8 72 0" fill="none" stroke="#3a3a3a" stroke-width="1.5"/>`;
  if (eq.hat === "explo") s += `<ellipse cx="200" cy="107" rx="42" ry="9" fill="#c8ac70"/><ellipse cx="200" cy="106" rx="38" ry="6" fill="#d8c08a"/><path d="M174 106 q0 -32 26 -32 q26 0 26 32z" fill="#eadab0"/><path d="M200 74 v32 M190 76 q-4 14 -2 30 M210 76 q4 14 2 30" fill="none" stroke="#c8ac70" stroke-width="1.6"/><rect x="174" y="98" width="52" height="7" fill="#8a6a3a"/><circle cx="200" cy="101.5" r="3" fill="#c99a2e"/><circle cx="200" cy="75" r="3" fill="#c8ac70"/><path d="M186 80 q6 -6 14 -6" fill="none" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>`;
  if (eq.hat === "forme") s += `<ellipse cx="200" cy="106" rx="39" ry="7" fill="#0a0a0a"/><path d="M178 106 l2 -50 q20 -6 40 0 l2 50z" fill="#161616"/><ellipse cx="200" cy="56" rx="21" ry="4.5" fill="#262626"/><path d="M184 98 l1 -38" stroke="#4a4a4a" stroke-width="3" stroke-linecap="round"/><rect x="178" y="92" width="44" height="9" fill="#a8323a"/><rect x="194" y="90" width="12" height="13" rx="1" fill="none" stroke="#e0b84a" stroke-width="2"/>`;
  // Main droite
  if (eq.hand === "canne") s += `<line x1="248" y1="222" x2="258" y2="286" stroke="#3b2412" stroke-width="4" stroke-linecap="round"/><path d="M248 222 q-2 -14 -13 -9" fill="none" stroke="#e0b84a" stroke-width="5.5" stroke-linecap="round"/><path d="M248 221 q-1 -10 -9 -8" fill="none" stroke="#fff6c0" stroke-width="1.4" stroke-linecap="round"/><g transform="rotate(-10 246 222)">${fist(242, 219)}</g>`;
  if (eq.hand === "loupe") s += `<line x1="244" y1="224" x2="257" y2="204" stroke="#3b2412" stroke-width="5.5" stroke-linecap="round"/><line x1="244" y1="224" x2="250" y2="214" stroke="#6b4a2b" stroke-width="3" stroke-linecap="round"/><circle cx="263" cy="190" r="14" fill="#cfefff77" stroke="#c99a2e" stroke-width="4.5"/><circle cx="263" cy="190" r="14" fill="none" stroke="#fff6c0" stroke-width=".9"/><path d="M254 184 q4 -7 12 -6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>${fist(238, 216)}`;
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
function drawScene(owned, equipped, date){
  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Le Professeur Plume dans sa maison">
    <defs><pattern id="wall" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="none"/><path d="M10 0 v20" stroke="#dcc79c" stroke-width="2"/><path d="M0 10 l5 -4 l5 4 l-5 4z" fill="#d6bf8c" opacity=".7"/><path d="M10 10 l5 -4 l5 4 l-5 4z" fill="#d6bf8c" opacity=".4"/></pattern>
    <linearGradient id="floorshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
    <radialGradient id="lampglow"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".75"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>
    <radialGradient id="lustreglow"><stop offset="0" stop-color="#fff0b8" stop-opacity=".6"/><stop offset="1" stop-color="#fff0b8" stop-opacity="0"/></radialGradient></defs>
    ${drawHome(owned, seasonOf(date))}${drawProfessor(equipped)}${owned.includes("chat") ? drawCat() : ""}</svg>`;
}

/* ---------- Éléments du ciel : un par jour (30), dessinés dans une boîte d'environ 44 x 36 centrée sur (0,0) ---------- */
const BIRD = "M-6 0 q3 -5 6 0 q3 -5 6 0";
const SKY_DRAW = [
  // 1 Un nuage
  () => `<ellipse cx="0" cy="11" rx="21" ry="3.5" fill="#9fb4c8" opacity=".35"/><g fill="#c9d8e6"><ellipse cx="0" cy="6" rx="22" ry="8"/><circle cx="-10" cy="1" r="8.5"/><circle cx="3" cy="-5" r="11"/><circle cx="15" cy="1" r="8"/></g><g fill="#fff"><ellipse cx="0" cy="4" rx="21" ry="7"/><circle cx="-10" cy="-1" r="8"/><circle cx="3" cy="-7" r="10.5"/><circle cx="15" cy="-1" r="7.5"/></g><path d="M-6 -12 q6 -5 12 -2" fill="none" stroke="#f4f9ff" stroke-width="3" stroke-linecap="round"/>`,
  // 2 Des oiseaux
  () => [[-14,-8,1],[6,-1,1.15],[-6,10,.8]].map(([x,y,k])=>`<g transform="translate(${x} ${y}) scale(${k})"><path d="M-10 -1 q4 -8 10 -1 q6 -7 10 1 q-5 -3 -10 2 q-5 -5 -10 -2z" fill="#26323f"/><path d="M-1 0 q1 3 3 1" fill="none" stroke="#26323f" stroke-width="1.2"/><circle cx="0" cy="0" r="1.6" fill="#26323f"/></g>`).join(""),
  // 3 Un arc-en-ciel
  () => `${["#e53935","#fb8c00","#fdd835","#43a047","#1e88e5","#5e35b1","#8e24aa"].map((c,i)=>{const r=23-i*2.2;return `<path d="M${-r} 14 A ${r} ${r} 0 0 1 ${r} 14" fill="none" stroke="${c}" stroke-width="2.4" opacity=".92"/>`;}).join("")}<g fill="#fff"><ellipse cx="-20" cy="15" rx="8" ry="4.5"/><circle cx="-23" cy="13" r="3.6"/><circle cx="-16" cy="12.5" r="3.6"/><ellipse cx="20" cy="15" rx="8" ry="4.5"/><circle cx="23" cy="13" r="3.6"/><circle cx="16" cy="12.5" r="3.6"/></g>`,
  // 4 La lune
  () => `<circle cx="0" cy="0" r="22" fill="#fff6c0" opacity=".18"/><circle cx="0" cy="0" r="17" fill="#fff6c0" opacity=".22"/><path d="M6 -16 A16 16 0 1 0 6 16 A12 12 0 1 1 6 -16z" fill="#f7f1d0" stroke="#d6cb94" stroke-width=".8"/><circle cx="-9" cy="-4" r="2.6" fill="#e0d6a4"/><circle cx="-6" cy="7" r="3.2" fill="#e0d6a4"/><circle cx="-12" cy="3" r="1.4" fill="#e0d6a4"/><circle cx="-4" cy="-10" r="1.6" fill="#e0d6a4"/><path d="M-12 -11 q6 -5 13 -5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`,
  // 5 Un avion
  () => `<path d="M-44 3 L-20 0.6 L-20 4z" fill="#fff" opacity=".65"/><path d="M-40 6 L-20 4 L-20 6z" fill="#fff" opacity=".4"/><g transform="translate(4 0)"><path d="M-22 -1 q0 -4 6 -5 h22 q10 0 16 5 q-5 5 -16 5 h-22 q-6 0 -6 -5z" fill="#eef2f6" stroke="#8a97a3" stroke-width=".8"/><path d="M-22 1 q10 3 38 3 q-5 3 -16 3 h-22 q-6 0 0 -6z" fill="#cfd8e0"/><path d="M-20 -1 l-9 -13 h6 l11 13z" fill="#c0343e" stroke="#8a1f26" stroke-width=".6"/><path d="M-3 1 l-13 14 h8 l17 -14z" fill="#d6dee6" stroke="#8a97a3" stroke-width=".8"/><path d="M-3 -2 l-13 -14 h8 l17 14z" fill="#e4eaf0" stroke="#8a97a3" stroke-width=".8"/><ellipse cx="-4" cy="8" rx="4" ry="2.2" fill="#9aa5b0" stroke="#6a7580" stroke-width=".6"/><path d="M12 -4 q5 0 9 3 l-9 0z" fill="#3a7ab8"/>${[-14,-9,-4,1,6].map(x=>`<circle cx="${x}" cy="-1" r="1" fill="#5a95c8"/>`).join("")}<path d="M-15 -4 q16 -2 34 3" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/></g>`,
  // 6 Un cerf-volant
  () => `<path d="M0 16 q-9 5 -1 10 q8 4 1 9 q-6 4 -2 8" fill="none" stroke="#6a4a2a" stroke-width="1"/>${[[-1,24,"#d36ac2"],[1,32,"#2c7ab8"],[-1,40,"#f2c94c"]].map(([x,y,c])=>`<path d="M${x-5} ${y-3.4} l5 3.4 l-5 3.4z M${x+5} ${y-3.4} l-5 3.4 l5 3.4z" fill="${c}" stroke="#4a3a2a" stroke-width=".5" stroke-linejoin="round"/><circle cx="${x}" cy="${y}" r="1" fill="#4a3a2a"/>`).join("")}<path d="M0 -19 L13 -4 L0 17 L-13 -4z" fill="#000" opacity=".12" transform="translate(1.2 1.6)"/><path d="M0 -19 L-13 -4 L0 -4z" fill="#e2563d"/><path d="M0 -19 L13 -4 L0 -4z" fill="#f6d04a"/><path d="M-13 -4 L0 17 L0 -4z" fill="#2c7ab8"/><path d="M13 -4 L0 17 L0 -4z" fill="#43a047"/><path d="M0 -19 L13 -4 L0 17 L0 -4z" fill="#000" opacity=".13"/><path d="M-9 -8 l7 -7 M-9 1 l6 8" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".5"/><path d="M0 -19 L13 -4 L0 17 L-13 -4z" fill="none" stroke="#5a2a1a" stroke-width=".9" stroke-linejoin="round"/><path d="M0 -19 V17 M-13 -4 H13" stroke="#8a6a3a" stroke-width="1.1"/><circle cx="0" cy="-4" r="1.8" fill="#c99a2e" stroke="#7a5a12" stroke-width=".6"/>`,
  // 7 Un papillon
  () => `<g transform="rotate(-12)"><path d="M0 0 q-10 -17 -20 -12 q-5 9 4 15 q8 3 16 -3z" fill="#f08a1f" stroke="#2a1a10" stroke-width="1.2"/><path d="M0 0 q10 -17 20 -12 q5 9 -4 15 q-8 3 -16 -3z" fill="#f08a1f" stroke="#2a1a10" stroke-width="1.2"/><path d="M0 2 q-9 3 -13 10 q3 7 11 3 q4 -5 2 -13z" fill="#f2b030" stroke="#2a1a10" stroke-width="1.2"/><path d="M0 2 q9 3 13 10 q-3 7 -11 3 q-4 -5 -2 -13z" fill="#f2b030" stroke="#2a1a10" stroke-width="1.2"/><path d="M-3 -2 q-8 -6 -14 -8 M3 -2 q8 -6 14 -8 M-3 2 q-8 2 -13 4 M3 2 q8 2 13 4" stroke="#2a1a10" stroke-width=".8" fill="none"/><circle cx="-16" cy="-8" r="1.6" fill="#fff"/><circle cx="16" cy="-8" r="1.6" fill="#fff"/><circle cx="-10" cy="9" r="1.3" fill="#fff"/><circle cx="10" cy="9" r="1.3" fill="#fff"/><ellipse cx="0" cy="3" rx="1.8" ry="9" fill="#2a1a10"/><circle cx="0" cy="-7" r="2.2" fill="#2a1a10"/><path d="M-1 -9 q-3 -6 -6 -7 M1 -9 q3 -6 6 -7" stroke="#2a1a10" stroke-width="1" fill="none"/></g>`,
  // 8 Une étoile filante
  () => `<path d="M-42 26 L8 -8 L11 -3z" fill="#ffe27a" opacity=".35"/><path d="M-30 20 L8 -6 L10 -2z" fill="#fff0a0" opacity=".6"/><path d="M-16 11 L9 -5 L10 -3z" fill="#fff" opacity=".9"/><circle cx="14" cy="-9" r="9" fill="#ffe27a" opacity=".25"/><path d="M14 -19 l3 7 l8 0 l-6 5 l2.5 8 l-7.5 -5 l-7.5 5 l2.5 -8 l-6 -5 l8 0z" fill="#ffd84a" stroke="#d8a82a" stroke-width=".8" stroke-linejoin="round"/><path d="M14 -15 l1.6 4.4" stroke="#fff" stroke-width="1.2" opacity=".8"/><path d="M-6 -12 l1 -3 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1z" fill="#fff"/>`,
  // 9 Un dirigeable
  () => `<path d="M-13 -6 q-1 -10 6 -11 l4 7z M-13 6 q-1 10 6 11 l4 -7z" fill="#b8503f" stroke="#7a2a1f" stroke-width=".8"/><path d="M-13 -4 l-10 -8 v8z M-13 4 l-10 8 v-8z" fill="#c0343e" stroke="#7a2a1f" stroke-width=".8"/><ellipse cx="0" cy="0" rx="24" ry="10.5" fill="#e6d8b8" stroke="#8a7a58" stroke-width=".9"/><path d="M-22 -4 q22 -10 44 0 q-22 -6 -44 0z" fill="#fff" opacity=".7"/><path d="M-24 3 q24 12 48 0 q-24 6 -48 0z" fill="#b8a880"/><path d="M-12 -10 q-4 10 0 20 M0 -10.5 q-3 10.5 0 21 M12 -10 q4 10 0 20" fill="none" stroke="#8a7a58" stroke-width=".7"/><rect x="-6" y="10" width="14" height="5.5" rx="2" fill="#6a4a2a" stroke="#3a2410" stroke-width=".7"/>${[-3,1,5].map(x=>`<rect x="${x}" y="11.2" width="2" height="2.2" fill="#bfe3f0"/>`).join("")}<path d="M-4 9 l-1 2 M6 9 l1 2" stroke="#3a2410" stroke-width=".8"/><circle cx="25" cy="0" r="1.6" fill="#555"/><path d="M25 -5 v10" stroke="#555" stroke-width="1" opacity=".6"/>`,
  // 10 Une soucoupe volante
  () => `<path d="M-9 8 L-17 28 H17 L9 8z" fill="#baf0c8" opacity=".28"/><path d="M-10 5 q0 -17 10 -17 q10 0 10 17z" fill="#bfeaf5" stroke="#5a7a8a" stroke-width=".9"/><path d="M-6 -3 q2 -7 7 -8" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="0" cy="-2" rx="4" ry="4.5" fill="#7ad08a" stroke="#3a7a4a" stroke-width=".6"/><circle cx="-1.5" cy="-3" r=".9" fill="#111"/><circle cx="1.8" cy="-3" r=".9" fill="#111"/><ellipse cx="0" cy="6" rx="24" ry="7" fill="#aeb8c2" stroke="#5a6874" stroke-width=".9"/><path d="M-24 6 q24 8 48 0 q-24 11 -48 0z" fill="#7e8a96"/><path d="M-20 4 q20 -4 40 0" fill="none" stroke="#e2eaf0" stroke-width="1.2"/>${[-16,-8,0,8,16].map((x,i)=>`<circle cx="${x}" cy="${7.5+(i%2?.6:0)}" r="1.5" fill="${["#ffe27a","#ff8a8a","#9ad8ff","#ff8a8a","#ffe27a"][i]}"/>`).join("")}`,
  // 11 Un hélicoptère
  () => `<ellipse cx="0" cy="-13" rx="24" ry="1.8" fill="#4a4a4a" opacity=".28"/><path d="M-22 -13 h44" stroke="#3a3a3a" stroke-width="1.6" stroke-linecap="round"/><rect x="-1.6" y="-13" width="3.2" height="6" fill="#3a3a3a"/><path d="M-9 -2 q0 -9 9 -9 q8 0 12 6 l2 7 q0 5 -6 5 h-12 q-5 0 -5 -9z" fill="#d8393f" stroke="#8a1f26" stroke-width=".9"/><path d="M-2 -5 q2 -5 7 -4 q4 1 6 5 l-13 0z" fill="#bfe3f0" stroke="#8a1f26" stroke-width=".6"/><path d="M0 -8 q3 -2 6 -1" fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round"/><path d="M-9 -3 h-14 q-4 0 -4 -2 l0 -4 l4 0 l3 3 h11z" fill="#c0343e" stroke="#8a1f26" stroke-width=".8"/><circle cx="-26" cy="-6" r="3.4" fill="none" stroke="#3a3a3a" stroke-width=".8"/><path d="M-26 -9 v6" stroke="#3a3a3a" stroke-width=".8"/><path d="M-8 8 h20 M-4 4 l-1 4 M6 4 l1 4" stroke="#3a3a3a" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="M-9 1 h16" stroke="#fff" stroke-width="1.4" opacity=".7"/>`,
  // 12 Des oies sauvages
  () => [[0,-10,1.15],[-9,-3,1],[9,-3,1],[-18,4,.9],[18,4,.9]].map(([x,y,k])=>`<g transform="translate(${x} ${y}) scale(${k})"><path d="M-8 -3 q4 -3 8 2 q4 -5 8 -2 q-5 0 -8 5 q-3 -5 -8 -5z" fill="#4a4036"/><ellipse cx="0" cy="2" rx="2.2" ry="4.4" fill="#d8ccb8"/><circle cx="0" cy="-3" r="1.5" fill="#2a2420"/><path d="M0 -4 l2.6 -1" stroke="#e08a1f" stroke-width="1"/><path d="M0 6 l0 3" stroke="#e08a1f" stroke-width="1"/></g>`).join(""),
  // 13 Un parachutiste
  () => `<path d="M-19 -4 q-1 -20 19 -20 q20 0 19 20 q-4 -5 -9.5 0 q-5 -5 -9.5 0 q-5 -5 -9.5 0 q-5 -5 -9.5 0z" fill="#e2563d" stroke="#8a2a1a" stroke-width=".9"/><path d="M-9 -4 q-2 -20 9 -20 q11 0 9 20 q-4 -4 -9 0 q-5 -4 -9 0z" fill="#fff"/><path d="M-19 -4 q-1 -20 10 -20 q-6 4 -3 20z" fill="#2c4a8a"/><path d="M19 -4 q1 -20 -10 -20 q6 4 3 20z" fill="#2c4a8a"/><path d="M-19 -4 L-2 12 M-9.5 -4 L-1 12 M9.5 -4 L1 12 M19 -4 L2 12" stroke="#4a3a2a" stroke-width=".7"/><circle cx="0" cy="15" r="3" fill="#f1c27d" stroke="#8a5a2b" stroke-width=".6"/><path d="M-3 14 a3 3 0 0 1 6 0z" fill="#d8393f"/><rect x="-3.4" y="17.5" width="6.8" height="8" rx="2" fill="#2c6a4a"/><rect x="-5" y="18" width="2" height="6" rx="1" fill="#8a5a2b"/><path d="M-2 25 l-2 7 M2 25 l2 7 M-3 19 l-5 5 M3 19 l5 5" stroke="#2c6a4a" stroke-width="2" stroke-linecap="round"/><path d="M-5 32 h3 M2 32 h3" stroke="#3a2410" stroke-width="2" stroke-linecap="round"/>`,
  // 14 Une fusée
  () => `<g fill="#fff" opacity=".7"><circle cx="-6" cy="30" r="5"/><circle cx="5" cy="31" r="6"/><circle cx="0" cy="36" r="5"/></g><path d="M-5 20 q5 12 5 18 q0 -6 5 -18z" fill="#ff8a1a"/><path d="M-3 20 q3 7 3 11 q0 -4 3 -11z" fill="#ffe27a"/><path d="M-6 10 l-8 12 v-6 q0 -6 4 -10z M6 10 l8 12 v-6 q0 -6 -4 -10z" fill="#c0343e" stroke="#7a1f26" stroke-width=".8"/><path d="M-7 14 q0 -22 7 -33 q7 11 7 33z" fill="#f4f6f8" stroke="#8a929a" stroke-width=".9"/><path d="M1 -17 q5 12 5 31 h-3 q0 -17 -2 -31z" fill="#cfd6de"/><path d="M-5 -6 q5 -13 5 -13 q0 0 5 13z" fill="#c0343e"/><circle cx="0" cy="-1" r="3.4" fill="#6aa8d8" stroke="#8a929a" stroke-width="1.2"/><path d="M-1.6 -2.4 q1 -1.4 2.4 -1.2" stroke="#fff" fill="none" stroke-width=".9"/><rect x="-7" y="12" width="14" height="3" fill="#8a929a"/>`,
  // 15 Un nuage en cœur
  () => `<path d="M0 16 C-28 -3 -17 -22 0 -9 C17 -22 28 -3 0 16z" fill="#f2b8cc" opacity=".55" transform="translate(0 2)"/><path d="M0 14 C-26 -4 -16 -20 0 -8 C16 -20 26 -4 0 14z" fill="#fff" stroke="#f08aa8" stroke-width="1.1"/><path d="M-13 -9 q4 -4 9 -3 M-17 -2 q0 -3 2 -5" fill="none" stroke="#fde0ea" stroke-width="2.4" stroke-linecap="round"/><path d="M20 -16 c-2 -3 -6 -1 -3 3 l3 3 l3 -3 c3 -4 -1 -6 -3 -3z" fill="#f06a90" transform="scale(.7) translate(10 -6)"/>`,
  // 16 Une comète
  () => `<path d="M-42 24 q22 -10 44 -22 l-1 5 q-22 10 -43 17z" fill="#9ad8ff" opacity=".4"/><path d="M-40 14 q20 -9 42 -16 l0 4 q-20 7 -42 12z" fill="#cfeeff" opacity=".6"/><path d="M-34 6 q18 -6 36 -8 l0 3 q-18 3 -36 5z" fill="#fff" opacity=".8"/><circle cx="10" cy="-2" r="13" fill="#bfe8ff" opacity=".35"/><circle cx="10" cy="-2" r="8" fill="#fff6c0"/><circle cx="10" cy="-2" r="5" fill="#fff"/><circle cx="8" cy="-4" r="1.6" fill="#d8e8f0"/><path d="M20 -14 l1 -3 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1z M-8 -14 l.8 -2.4 l.8 2.4 l2.4 .8 l-2.4 .8 l-.8 2.4 l-.8 -2.4 l-2.4 -.8z" fill="#fff"/>`,
  // 17 Un feu d'artifice
  () => `<circle cx="0" cy="0" r="20" fill="#ffd84a" opacity=".12"/>${[...Array(14)].map((_,i)=>{const a=i*Math.PI/7,c=["#ff5a5a","#ffd84a","#6ab8ff","#8aea8a","#ff8ae0","#ffb04a","#fff"][i%7];const x2=(17*Math.cos(a)).toFixed(1),y2=(17*Math.sin(a)).toFixed(1),x1=(8*Math.cos(a)).toFixed(1),y1=(8*Math.sin(a)).toFixed(1);return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><circle cx="${(21*Math.cos(a)).toFixed(1)}" cy="${(21*Math.sin(a)).toFixed(1)}" r="1.6" fill="${c}"/><circle cx="${(13*Math.cos(a+Math.PI/14)).toFixed(1)}" cy="${(13*Math.sin(a+Math.PI/14)).toFixed(1)}" r=".9" fill="${c}" opacity=".8"/>`;}).join("")}<circle cx="0" cy="0" r="3" fill="#fff6c0"/><circle cx="0" cy="0" r="1.4" fill="#fff"/>`,
  // 18 Une hirondelle
  () => `<path d="M-22 -6 q10 -4 20 3 q3 -3 8 -2 q-3 3 -4 7 q-10 3 -24 -8z" fill="#22407a" stroke="#14264a" stroke-width=".7"/><path d="M-2 -3 q10 -10 22 -10 q-8 6 -10 14z" fill="#2a4a8a" stroke="#14264a" stroke-width=".7"/><path d="M-4 -3 q8 -2 14 2 q-2 5 -8 6 q-6 0 -6 -8z" fill="#22407a"/><path d="M-3 2 q6 4 12 0 q-3 5 -8 5z" fill="#f2e0c8"/><path d="M-4 3 q6 3 12 -1" fill="none" stroke="#d8c0a0" stroke-width=".6"/><path d="M-20 -5 l-14 14 M-20 -5 l-8 14" stroke="#14264a" stroke-width="1.4" stroke-linecap="round"/><circle cx="7" cy="-2" r="1.2" fill="#fff"/><circle cx="7.2" cy="-2" r=".6" fill="#111"/><path d="M10 -2 l4 1 l-4 1z" fill="#e08a1f"/><path d="M5 0 q2 2 4 1" stroke="#b8503f" fill="none" stroke-width="1.4"/>`,
  // 19 Un ballon rouge
  () => `<path d="M1 12 q-5 6 0 12 q5 6 -1 12 q-4 5 1 9" fill="none" stroke="#6a5a4a" stroke-width=".9"/><path d="M0 -17 q-13 0 -13 13 q0 11 11 17 q-3 3 -4 4 h12 q-1 -1 -4 -4 q11 -6 11 -17 q0 -13 -13 -13z" fill="#d8393f" stroke="#8a1f26" stroke-width=".9" transform="translate(0 0)"/><path d="M-1 -17 q-5 0 -9 5 q-3 5 -1 11" fill="none" stroke="#f08a8a" stroke-width="2.4" stroke-linecap="round" opacity=".8"/><ellipse cx="-6" cy="-10" rx="2.2" ry="4" fill="#fff" opacity=".7" transform="rotate(25 -6 -10)"/><path d="M-3 16 q3 -1 6 0 l-3 4z" fill="#8a1f26"/><path d="M5 -8 q3 4 3 9" fill="none" stroke="#8a1f26" stroke-width=".8" opacity=".5"/>`,
  // 20 Un satellite
  () => `<g transform="rotate(-24)"><path d="M-9 0 h-3 M9 0 h3" stroke="#6a7580" stroke-width="1.6" stroke-linecap="round"/>${[-1,1].map(d=>`<g transform="scale(${d} 1)"><rect x="12" y="-6.5" width="13" height="13" rx=".8" fill="#2a5aa8" stroke="#8a97a3" stroke-width=".9"/><path d="M16.3 -6.5 v13 M20.6 -6.5 v13 M12 -2.2 h13 M12 2.2 h13" stroke="#8fb4e8" stroke-width=".6"/><path d="M13.6 -5 l5 -0 l-5 5z" fill="#fff" opacity=".28"/></g>`).join("")}<path d="M0 -7 v-4" stroke="#6a7580" stroke-width="1.4"/><path d="M-6 -11.4 q6 -7 12 0z" fill="#e8eef4" stroke="#6a7580" stroke-width=".9" stroke-linejoin="round"/><circle cx="0" cy="-14" r="1.1" fill="#d8393f"/><rect x="-9" y="-7.5" width="18" height="15" rx="2" fill="#e0b84a" stroke="#8a6a1e" stroke-width=".9"/><path d="M-9 -2 h18 M-9 3 h18 M-3 -7.5 v15 M3 -7.5 v15" stroke="#b8923a" stroke-width=".6"/><path d="M-7 -6 l6 0 l-6 6z" fill="#fff6c0" opacity=".55"/><rect x="-9" y="4.6" width="18" height="3" fill="#2a3a4a"/><circle cx="-5" cy="6.1" r=".8" fill="#7ac8ff"/><circle cx="5" cy="6.1" r=".8" fill="#ffe27a"/><path d="M0 7.5 v4 M-2 11.5 h4" stroke="#6a7580" stroke-width="1.2" stroke-linecap="round"/></g><path d="M-26 14 l1 -2.4 l1 2.4 l2.4 1 l-2.4 1 l-1 2.4 l-1 -2.4 l-2.4 -1z" fill="#fff" opacity=".85"/>`,
  // 21 Un drone
  () => `<g stroke="#2a323a" stroke-width="2" stroke-linecap="round"><path d="M-6 -2 L-17 -9 M6 -2 L17 -9 M-6 3 L-17 10 M6 3 L17 10"/></g>${[[-17,-9],[17,-9],[-17,10],[17,10]].map(([x,y])=>`<ellipse cx="${x}" cy="${y-2}" rx="9" ry="1.8" fill="#6a7a8a" opacity=".45"/><path d="M${x-9} ${y-2} h18" stroke="#2a323a" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="2.2" fill="#3a4650"/>`).join("")}<rect x="-8" y="-5" width="16" height="10" rx="4" fill="#e8ecf0" stroke="#5a6874" stroke-width=".9"/><path d="M-5 -3 h10" stroke="#fff" stroke-width="1.2"/><circle cx="0" cy="7" r="3" fill="#2a323a" stroke="#6a7a8a" stroke-width=".8"/><circle cx="-.8" cy="6.2" r=".9" fill="#7ac8ff"/><circle cx="5" cy="0" r="1.2" fill="#e53935"/><circle cx="-5" cy="0" r="1.2" fill="#43a047"/><path d="M-9 14 v4 h18 v-4" fill="none" stroke="#2a323a" stroke-width="1.2"/>`,
  // 22 Un orage
  () => `<g fill="#3e4854"><ellipse cx="0" cy="-3" rx="22" ry="8"/><circle cx="-10" cy="-8" r="9"/><circle cx="4" cy="-13" r="11"/><circle cx="16" cy="-7" r="8"/></g><g fill="#56626f"><ellipse cx="0" cy="-5" rx="20" ry="6"/><circle cx="-9" cy="-10" r="7.5"/><circle cx="4" cy="-15" r="9.5"/></g><path d="M-14 -16 q6 -5 12 -3" fill="none" stroke="#7a8896" stroke-width="2.4" stroke-linecap="round"/><path d="M2 2 l-9 11 h6 l-6 14 l15 -17 h-7 l7 -8z" fill="#ffe27a" opacity=".45" transform="scale(1.15) translate(-1 -1)"/><path d="M2 2 l-9 11 h6 l-6 14 l15 -17 h-7 l7 -8z" fill="#ffe27a" stroke="#d8a82a" stroke-width=".9" stroke-linejoin="round"/>`,
  // 23 Une cigogne
  () => `<path d="M2 3 q-10 4 -24 -1 q-3 3 -1 5 q12 3 24 -2z" fill="#fff" stroke="#8a929a" stroke-width=".7"/><path d="M-22 2 l-10 5 l1 3 l11 -5z" fill="#c0343e" opacity="0"/><path d="M-6 0 q8 -14 24 -14 q-4 8 -8 12 q-8 4 -16 2z" fill="#fff" stroke="#8a929a" stroke-width=".8"/><path d="M4 -10 q8 -6 14 -4 q-3 4 -6 5 q-5 0 -8 -1z" fill="#23272d"/><path d="M-4 3 q8 -4 16 -1 q-4 5 -12 5z" fill="#23272d" opacity=".9"/><path d="M-6 0 q-12 -3 -22 4 q10 4 22 3z" fill="#fff" stroke="#8a929a" stroke-width=".8"/><path d="M-6 0 q-10 -2 -18 2 q8 -1 18 1z" fill="#23272d"/><path d="M-4 3 q-6 -4 -12 -1 q5 5 12 3z" fill="#fff"/><path d="M14 -4 q6 -4 10 -3 l8 0 l-2 2 q-6 0 -8 1 q-4 3 -8 0z" fill="#fff" stroke="#8a929a" stroke-width=".6"/><path d="M24 -6 l14 0 l-14 3z" fill="#d8393f" stroke="#8a1f26" stroke-width=".6" transform="translate(-2 1)"/><circle cx="22" cy="-6" r=".9" fill="#111"/><path d="M-14 8 l-10 10 M-12 9 l-10 11" stroke="#d8393f" stroke-width="1.3" stroke-linecap="round"/>`,
  // 24 Saturne
  () => `<ellipse cx="0" cy="0" rx="24" ry="7" fill="none" stroke="#c9a85a" stroke-width="3.6" transform="rotate(-22)" opacity=".85"/><ellipse cx="0" cy="0" rx="19" ry="5" fill="none" stroke="#e8d08a" stroke-width="1.6" transform="rotate(-22)"/><circle cx="0" cy="0" r="12" fill="#e8c878" stroke="#b8923a" stroke-width=".8"/><path d="M-11 -3 q11 4 22 -1 M-12 2 q12 5 24 0 M-9 7 q9 4 18 0" fill="none" stroke="#c8a050" stroke-width="1.6"/><path d="M-8 -8 q5 -5 11 -4" fill="none" stroke="#fff6c0" stroke-width="2" stroke-linecap="round" opacity=".8"/><path d="M12 0 A12 12 0 0 1 -6 10 A12 12 0 0 0 12 0z" fill="#8a6a2a" opacity=".35"/><path d="M-24 5 q24 8 44 -9" fill="none" stroke="#c9a85a" stroke-width="3.6" transform="rotate(-22)" opacity="0"/><path d="M-22 -2 q22 12 45 -2" fill="none" stroke="#c9a85a" stroke-width="3.6" transform="rotate(-22) translate(0 0)" opacity="0"/><path d="M-22 1 A24 7 0 0 0 22 1" fill="none" stroke="#c9a85a" stroke-width="3.6" transform="rotate(-22)"/>`,
  // 25 Le traîneau du Père Noël
  () => `<path d="M-44 8 q10 2 20 0" stroke="#ffd84a" stroke-width="1" opacity=".5" fill="none" stroke-dasharray="1.6 2.4"/><path d="M-24 6 q8 4 18 4 h20 q4 0 4 -5 v-4 h-8 l-3 -9 h-22 l-2 8 q-6 0 -7 6z" fill="#c0343e" stroke="#7a1f26" stroke-width=".9"/><path d="M-27 3 q-4 -2 -3 -6" fill="none" stroke="#c99a2e" stroke-width="1.6" stroke-linecap="round"/><path d="M-26 14 q10 2 36 0 q3 0 4 -3" fill="none" stroke="#c99a2e" stroke-width="1.8" stroke-linecap="round"/><path d="M-18 10 v4 M2 10 v4" stroke="#c99a2e" stroke-width="1.2"/><circle cx="-12" cy="-12" r="8" fill="#8a5a2b" stroke="#5a3a1a" stroke-width=".8"/><path d="M-18 -16 q6 -3 12 0" fill="none" stroke="#c99a2e" stroke-width="1.6"/><rect x="-6" y="-8" width="7" height="6" fill="#2c7ab8" stroke="#1a4a78" stroke-width=".6"/><path d="M-2.5 -8 v6 M-6 -5 h7" stroke="#ffd84a" stroke-width=".8"/><circle cx="2" cy="-8" r="3.4" fill="#f1c27d"/><path d="M-1 -10 a3.4 3.4 0 0 1 6 0z" fill="#d8393f"/><path d="M0 -6 q2 4 4 0" fill="#fff" stroke="#fff"/><path d="M12 5 q12 0 14 -2" stroke="#8a5a2b" stroke-width=".9" fill="none"/><path d="M26 5 q2 -6 8 -6 q4 0 6 -3 l2 2 l-2 3 q-2 3 -6 3 l-1 5 h-2 l0 -4 h-4 l-1 4 h-2z" fill="#8a5a2b" stroke="#5a3a1a" stroke-width=".7"/><path d="M40 -4 l3 -5 M40 -4 l-1 -6 M43 -9 l3 -2" stroke="#5a3a1a" stroke-width=".9" stroke-linecap="round"/><circle cx="42" cy="-1" r="1.6" fill="#e53935"/>`,
  // 26 Un avion en papier
  () => `<path d="M-42 15 q8 -14 20 -6 q10 7 3 12 q-7 3 -9 -3" fill="none" stroke="#9fb4c8" stroke-width="1" stroke-dasharray="2 3" stroke-linecap="round"/><g transform="rotate(-24) scale(1 .86)"><path d="M26 0 L-22 -14 L-12 0z" fill="#fff" stroke="#8a97a3" stroke-width=".9" stroke-linejoin="round"/><path d="M26 0 L-22 14 L-12 0z" fill="#d6dee7" stroke="#8a97a3" stroke-width=".9" stroke-linejoin="round"/><path d="M26 0 L-12 0" stroke="#6a7886" stroke-width="1.2"/><path d="M-12 0 L-6 -1.4 L-6 1.4z" fill="#b8c3ce"/><path d="M-14 -11 L8 -5.4 M-8 -6 L-8 -.6" stroke="#c4cfd9" stroke-width=".7"/><path d="M-14 11 L8 5.4" stroke="#b4c0cc" stroke-width=".7"/><path d="M20 -1.6 L-6 -6.6" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".9"/></g>`,
  // 27 Un nuage de pluie
  () => `<g fill="#6a7886"><ellipse cx="0" cy="-5" rx="22" ry="8"/><circle cx="-10" cy="-10" r="9"/><circle cx="4" cy="-15" r="11"/><circle cx="16" cy="-9" r="8"/></g><g fill="#8a98a6"><ellipse cx="0" cy="-7" rx="20" ry="6"/><circle cx="-9" cy="-12" r="7.5"/><circle cx="4" cy="-17" r="9.5"/></g><path d="M-14 -18 q6 -5 12 -3" fill="none" stroke="#b0bcc8" stroke-width="2.4" stroke-linecap="round"/>${[[-16,3],[-8,5],[0,3],[8,5],[16,3],[-12,13],[-4,15],[4,13],[12,15]].map(([x,y])=>`<path d="M${x} ${y} q-2.2 3.6 -1.2 5.2 q1.6 1.4 2.8 -.2 q.6 -1.6 -1.6 -5z" fill="#4a90d9" stroke="#2a64a8" stroke-width=".5"/>`).join("")}`,
  // 28 Un aigle
  () => { const wing = `<path d="M-3 -4 C-10 -15 -20 -15 -30 -10 L-27 -6.5 L-32 -4 L-27 -1 L-31 2.5 L-25 3.2 L-27 7.4 L-19 5 L-13 8.6 L-3 5.6z" fill="#5e4024" stroke="#2e1c0c" stroke-width=".8" stroke-linejoin="round"/><path d="M-3 -4 C-9 -12 -18 -12 -26 -8.6 C-19 -5 -12 -2.4 -3 2z" fill="#8a6a42"/><path d="M-3 -4 C-8 -9.4 -14 -9.6 -19 -8.4 C-14 -4.6 -9 -3 -3 -1z" fill="#b08a5a"/><path d="M-27 -6.4 L-12 -1.4 M-27 -1 L-12 2 M-25 3.2 L-12 4.4 M-19 5 L-10 6.2" stroke="#2e1c0c" stroke-width=".7" fill="none"/><path d="M-6 -7 q-6 -3 -12 -2" stroke="#d2b078" stroke-width=".8" fill="none" opacity=".8"/>`;
    return `<path d="M-1.6 11 l-1.2 4 l-2.4 1.4 M1.6 11 l1.2 4 l2.4 1.4" stroke="#f2b030" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M-4.4 9 l-4.6 12 q9 4.6 18 0 l-4.6 -12z" fill="#fff" stroke="#8a97a3" stroke-width=".8" stroke-linejoin="round"/><path d="M-6.6 17 q6.6 2.4 13.2 0 M-5.4 13 q5.4 1.8 10.8 0" stroke="#8a6a42" stroke-width="1.1" fill="none"/><g>${wing}</g><g transform="scale(-1 1)">${wing}</g><ellipse cx="0" cy="1" rx="4.6" ry="11" fill="#7a5632" stroke="#3a2410" stroke-width=".9"/><path d="M-2.4 -4 q-1 8 .8 14 M2.4 -4 q1 8 -.8 14" fill="none" stroke="#9a7648" stroke-width="1" stroke-linecap="round"/><path d="M-3 -6.4 q3 1.6 6 0 M-3.2 -2.6 q3.2 1.6 6.4 0" fill="none" stroke="#5a3e22" stroke-width=".8"/><path d="M-3.8 -8 q3.8 2.6 7.6 0 l.6 -2.6 h-8.8z" fill="#fff"/><circle cx="0" cy="-11" r="4.6" fill="#fff" stroke="#8a97a3" stroke-width=".8"/><path d="M3.4 -12.4 q5.6 -.6 6.6 3.4 q-3.4 -1.2 -4.6 1.2 q-.8 -2.4 -2 -4.6z" fill="#f2b030" stroke="#c0861a" stroke-width=".6" stroke-linejoin="round"/><circle cx="1.4" cy="-12" r="1.1" fill="#ffe27a"/><circle cx="1.6" cy="-12" r=".6" fill="#111"/><path d="M-.4 -13.8 l3.8 .8" stroke="#8a6a42" stroke-width=".9" stroke-linecap="round"/>`; },
  // 29 Une mouette
  () => { const wing = `<path d="M-3 -2 C-9 -11 -19 -12 -26 -6 C-30 -3 -33 -4 -38 0 L-33 1.6 L-37 3.6 L-30 4 C-22 3 -12 4 -3 5z" fill="#c4ced8" stroke="#7a8896" stroke-width=".8" stroke-linejoin="round"/><path d="M-3 -2 C-9 -10 -17 -11 -23 -6.4 C-15 -4 -9 -1 -3 2z" fill="#e6ecf2"/><path d="M-26 -6 C-30 -3 -33 -4 -38 0 L-33 1.6 L-37 3.6 L-31 3.8 C-30 1 -29 -3 -26 -6z" fill="#23272d"/><circle cx="-34" cy="1.2" r=".8" fill="#fff"/><circle cx="-31" cy="-.4" r=".7" fill="#fff"/>`;
    return `<g>${wing}</g><g transform="scale(-1 1)">${wing}</g><path d="M-4 9 l-1.4 6 M4 9 l1.4 6" stroke="#e8908a" stroke-width="1.2" stroke-linecap="round"/><path d="M-12 -2 q12 -6 24 0 q3 6 -2 9 l-6 3 h-8 l-6 -3 q-5 -3 -2 -9z" fill="#fff" stroke="#8a97a3" stroke-width=".8" stroke-linejoin="round"/><path d="M-6 -3 q6 -3 12 0" fill="none" stroke="#dfe6ee" stroke-width="1.4"/><path d="M-3 12 l-3 9 h12 l-3 -9z" fill="#fff" stroke="#8a97a3" stroke-width=".8" stroke-linejoin="round"/><path d="M-4 19 h8" stroke="#23272d" stroke-width="1.2"/><circle cx="0" cy="-6" r="5" fill="#fff" stroke="#8a97a3" stroke-width=".8"/><path d="M3.8 -7.2 q6 .2 7.6 2.4 l-7.2 .8z" fill="#f2b030" stroke="#c0861a" stroke-width=".6" stroke-linejoin="round"/><circle cx="9.6" cy="-4.6" r=".8" fill="#d8393f"/><circle cx="1.6" cy="-7" r="1.1" fill="#111"/><circle cx="1.9" cy="-7.3" r=".4" fill="#fff"/>`; },
  // 30 L'étoile du soir
  () => `<circle cx="0" cy="0" r="18" fill="#fff6c0" opacity=".14"/><circle cx="0" cy="0" r="12" fill="#fff6c0" opacity=".25"/><circle cx="0" cy="0" r="6.5" fill="#fff6c0" opacity=".45"/><path d="M0 -17 L2.2 -2.2 L17 0 L2.2 2.2 L0 17 L-2.2 2.2 L-17 0 L-2.2 -2.2z" fill="#fff" stroke="#ffe27a" stroke-width=".7" stroke-linejoin="round"/><path d="M-10 -10 L-1.6 -1.6 M10 -10 L1.6 -1.6 M-10 10 L-1.6 1.6 M10 10 L1.6 1.6" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".8"/><circle cx="0" cy="0" r="2" fill="#fff"/>`
];

/* Réduction des éléments les plus larges pour qu'ils tiennent entre la maison et la montgolfière. */
/* Inclinaison (en degrés) de certains éléments du ciel. */
const SKY_ROT = { 5:16, 27:-14, 28:12 };
const SKY_SCALE = { 4:.75, 7:.8, 15:.8, 22:.78, 24:.58, 25:.8, 28:.67 };

/* ---------- Jardin (extérieur) ---------- */
function drawTree(S, id){
  const P = PAL[id], clusters = [[360,82,30],[338,98,20],[382,98,20],[350,62,18],[374,64,18]];
  let s = `<path d="M351 172 q4 -4 3 -22 l-1 -40 h14 l-1 40 q-1 18 4 22z" fill="#6b3f1d"/><path d="M356 170 q2 -30 0 -60 M363 168 q-1 -30 1 -58" fill="none" stroke="#4a2a12" stroke-width="1.2"/><path d="M360 112 q-14 -12 -22 -16 M360 108 q12 -10 22 -16" fill="none" stroke="#6b3f1d" stroke-width="4" stroke-linecap="round"/>`;
  if (id === "hiver") {
    s += `<path d="M360 104 q-6 -20 -4 -38 M360 100 q8 -18 14 -34 M346 100 q-8 -10 -16 -12 M374 98 q8 -8 14 -10 M356 78 q-8 -8 -12 -20 M368 78 q6 -10 10 -22" fill="none" stroke="#5a4630" stroke-width="3" stroke-linecap="round"/>
      <path d="M360 104 q-6 -20 -4 -38 M360 100 q8 -18 14 -34 M346 100 q-8 -10 -16 -12 M374 98 q8 -8 14 -10" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>
      <ellipse cx="360" cy="173" rx="24" ry="5" fill="#fff"/>`;
    return s;
  }
  const cols = id === "automne" ? ["#d9822b","#c0462a","#e8b030","#b8501f","#d9822b"] : [P.leaf, P.leaf2, P.leaf2, P.leaf, P.leaf];
  clusters.forEach(([x,y,r],i)=>{ s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${cols[i]}"/>`; });
  clusters.forEach(([x,y,r],i)=>{ s += `<circle cx="${x-r*.25}" cy="${y-r*.3}" r="${r*.55}" fill="${shade(cols[i],1.15)}" opacity=".7"/>`; });
  if (id === "printemps") s += [[350,70],[366,60],[372,86],[340,98],[384,96],[356,92],[362,76],[346,84],[378,72],[392,104],[332,92]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i%3?2.4:3.2}" fill="${i%2?"#ffd0e0":"#fff"}"/>`).join("");
  if (id === "ete") s += [[352,76],[370,68],[366,96],[344,92]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2" fill="#e2563d"/>`).join("");
  if (id === "automne") s += [[340,178],[348,184],[372,180],[384,186],[330,190],[392,176],[360,190]].map(([x,y],i)=>`<ellipse cx="${x}" cy="${y}" rx="4" ry="2" fill="${["#d9822b","#c0462a","#e8b030"][i%3]}" transform="rotate(${i*30} ${x} ${y})"/>`).join("");
  return s;
}

function drawFlowers(S){
  let s = "";
  const xs = [...Array(16)].map((_, k) => 142 + k * 12);
  if (S === "hiver") {
    s += `<path d="M136 218 q10 -10 30 -8 q20 -6 40 0 q20 -8 40 -2 q20 -6 40 0 q14 -2 30 10z" fill="#fff"/><path d="M140 218 q20 -6 40 -3 q40 -4 80 0 q30 -3 60 3" fill="none" stroke="#dfe8f1" stroke-width="2"/>`;
    xs.forEach((x,k)=>{ if (k%2===0) s += `<path d="M${x} 214 q0 -8 1 -12" fill="none" stroke="#3e8e3a" stroke-width="1.6"/><path d="M${x+1} 202 q-3 -1 -3 3 q2 3 4 0z" fill="#fff" stroke="#bcd0e0" stroke-width=".6"/>`; else if (k%4===1) s += `<circle cx="${x}" cy="211" r="2.2" fill="#c0343e"/><circle cx="${x+4}" cy="212" r="2" fill="#c0343e"/><path d="M${x-2} 212 q2 -4 6 -2" fill="none" stroke="#2e6a2a" stroke-width="1.4"/>`; });
    return s;
  }
  s += `<path d="M136 218 q10 -8 30 -6 q40 -4 80 0 q40 -4 84 6 v4 h-194z" fill="#6b4a2b"/><path d="M140 217 q40 -6 100 -2" fill="none" stroke="#8a6a3a" stroke-width="1.4" opacity=".7"/>`;
  xs.forEach((x,k)=>{
    const c = ["#e2563d","#f2c94c","#d36ac2","#ffffff"][k%4];
    const h = 8 + (k*5)%5;
    s += `<path d="M${x} 216 q${k%2?2:-2} -${h/2} 0 -${h}" fill="none" stroke="${S==="automne"?"#6a7a2a":"#2e7d32"}" stroke-width="2"/><path d="M${x} 212 q5 -2 7 -6 q-6 0 -7 6z" fill="${S==="automne"?"#8a8a2a":"#3e9a3e"}"/>`;
    const cy = 216 - h;
    if (S === "printemps") s += `<path d="M${x-4} ${cy} q0 -7 4 -7 q4 0 4 7 q-4 4 -8 0z" fill="${c}"/><path d="M${x-2} ${cy-5} l2 3 l2 -3" fill="none" stroke="${shade(c==="#ffffff"?"#cccccc":c,.75)}" stroke-width=".8"/>`;
    else if (S === "ete") s += k%2 ? `<circle cx="${x}" cy="${cy-1}" r="5" fill="#e2563d"/><circle cx="${x}" cy="${cy-1}" r="1.6" fill="#2a1a1a"/>` : `${[0,1,2,3,4,5].map(i=>`<ellipse cx="${(x+4*Math.cos(i*Math.PI/3)).toFixed(1)}" cy="${(cy-1+4*Math.sin(i*Math.PI/3)).toFixed(1)}" rx="2.4" ry="1.8" fill="#fff"/>`).join("")}<circle cx="${x}" cy="${cy-1}" r="2.2" fill="#f2b020"/>`;
    else s += `<circle cx="${x}" cy="${cy-1}" r="4.6" fill="${["#e07a1f","#9a2a3a","#f0b030","#b8501f"][k%4]}"/><circle cx="${x-1}" cy="${cy-2}" r="2.2" fill="${["#f0a050","#c0506a","#f8d870","#d8783a"][k%4]}"/>`;
  });
  if (S === "automne") s += [[150,218],[190,219],[250,218],[300,219]].map(([x,y],i)=>`<ellipse cx="${x}" cy="${y}" rx="3.4" ry="1.6" fill="${["#d9822b","#c0462a"][i%2]}" transform="rotate(${i*40} ${x} ${y})"/>`).join("");
  return s;
}

function drawGarden(owned, date){
  const h = id => owned.includes(id);
  const S = seasonOf(date), P = PAL[S], winter = S === "hiver", sky = SKY_DRAW[skyIndexOf(date)]();
  let s = `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Le jardin du Professeur Plume (${SEASON_NAMES[S].toLowerCase()})" data-season="${S}" data-sky="${skyIndexOf(date)}">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.skyT}"/><stop offset="1" stop-color="${P.skyB}"/></linearGradient></defs>
    <rect width="400" height="130" fill="url(#sky)"/>
    <circle cx="330" cy="30" r="${S === "ete" ? 20 : 16}" fill="${P.sun}"${S === "hiver" || S === "automne" ? ` opacity=".85"` : ""}/>
    ${S === "ete" ? `<circle cx="330" cy="30" r="28" fill="#ffe27a" opacity=".3"/>` : ""}
    ${S === "ete" ? "" : `<g fill="#fff" opacity=".85"><ellipse cx="50" cy="20" rx="16" ry="5"/><ellipse cx="60" cy="16" rx="10" ry="5"/><ellipse cx="285" cy="76" rx="14" ry="4"/><ellipse cx="294" cy="72" rx="8" ry="4"/></g>`}
    <g transform="translate(160 36) rotate(${SKY_ROT[skyIndexOf(date)] || 0}) scale(${SKY_SCALE[skyIndexOf(date)] || 1})">${sky}</g>
    <path d="M0 125 q80 -40 170 -5 q90 -35 230 0 v20 H0z" fill="${P.hill}"/>
    <path d="M0 128 q60 -22 130 -8 q80 -20 160 -4 q60 -8 110 6 v14 H0z" fill="${P.hill2}"/>
    ${[[24,118],[190,118],[236,112],[300,116],[326,112]].map(([x,y],i)=>`<g><rect x="${x-1}" y="${y}" width="2.4" height="8" fill="#5a4630"/>${winter ? `<path d="M${x} ${y} l-5 5 M${x} ${y} l5 5 M${x} ${y-4} v4" stroke="#7a6a5a" stroke-width="1.4" fill="none"/>` : `<circle cx="${x}" cy="${y-1}" r="${6+i%2*2}" fill="${P.far}"/>`}</g>`).join("")}
    <rect y="125" width="400" height="95" fill="${P.grass}"/>
    ${[...Array(18)].map((_,i)=>`<path d="M${(i*53)%390+4} ${135+(i*37)%78} q3 -5 6 0 M${(i*53)%390+10} ${135+(i*37)%78} q2 -4 4 0" stroke="${P.grass2}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`).join("")}
    <path d="M58 170 h24 l16 50 h-56z" fill="${P.path}"/>
    ${[[70,180],[65,192],[75,196],[62,208],[78,210]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="4" ry="2" fill="${shade(P.path,.88)}"/>`).join("")}`;
  // Maison (façade, toujours présente)
  s += `<rect x="15" y="80" width="110" height="90" fill="#efe0bc"/><rect x="15" y="80" width="110" height="90" fill="none" stroke="#7b4f2a" stroke-width="2"/>
    <rect x="15" y="162" width="110" height="8" fill="#8a7a68"/>
    <rect x="98" y="44" width="16" height="30" fill="#8a4a3a"/><rect x="96" y="42" width="20" height="5" fill="#6a3a2a"/><path d="M99 52 h14 M99 60 h14 M105 44 v30" stroke="#6a3a2a" stroke-width=".8"/>
    ${S === "automne" || winter ? `<g fill="${winter ? "#fff" : "#d8d8d8"}" opacity=".8"><circle cx="106" cy="36" r="5"/><circle cx="112" cy="28" r="6.5"/><circle cx="121" cy="20" r="8"/></g>` : ""}
    <path d="M3 84 L70 36 L137 84z" fill="${P.roof}"/>
    ${[0,1,2,3].map(r=>`<path d="M${20+r*10} ${74-r*9+ (r?0:0)} h${100-r*20}" stroke="${shade(P.roof,.8)}" stroke-width="1.2" opacity="0"/>`).join("")}
    ${[48,56,64,72].map((y,r)=>{const dx=(y-36)*1.4;return `<path d="M${70-dx+4} ${y} h${2*dx-8}" stroke="${shade(P.roof,.78)}" stroke-width="1.3"/>`;}).join("")}
    ${winter ? `<path d="M6 82 L70 38 L134 82" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/><path d="M10 80 q8 6 14 0 q8 6 14 0 M104 80 q8 6 14 0 q8 6 14 0" fill="none" stroke="#fff" stroke-width="3"/>` : `<path d="M3 84 L70 36 L137 84" fill="none" stroke="${shade(P.roof,.7)}" stroke-width="2.4"/>`}
    <circle cx="70" cy="62" r="7" fill="#9fd3f0" stroke="#5a3a1a" stroke-width="2.4"/><path d="M63 62 h14 M70 55 v14" stroke="#5a3a1a" stroke-width="1.2"/>
    <rect x="56" y="123" width="28" height="47" rx="2" fill="#6b3f1d"/><rect x="60" y="127" width="9" height="16" fill="#8a5a2b"/><rect x="71" y="127" width="9" height="16" fill="#8a5a2b"/><rect x="60" y="147" width="9" height="19" fill="#8a5a2b"/><rect x="71" y="147" width="9" height="19" fill="#8a5a2b"/><circle cx="79" cy="150" r="2" fill="#c99a2e"/><rect x="52" y="168" width="36" height="4" fill="#9a8a78"/>
    ${[[23,93],[91,93]].map(([x])=>`<rect x="${x-4}" y="91" width="6" height="26" fill="#2c6a5a"/><rect x="${x+26}" y="91" width="6" height="26" fill="#2c6a5a"/><rect x="${x}" y="93" width="26" height="22" fill="${winter ? "#ffe9a0" : "#9fd3f0"}" stroke="#5a3a1a" stroke-width="3"/><path d="M${x+13} 93 v22 M${x} 104 h26" stroke="#5a3a1a" stroke-width="1.6"/><rect x="${x-2}" y="115" width="30" height="6" fill="#6b3f1d"/>${winter ? "" : `<path d="M${x+2} 115 q3 -6 6 0 q3 -6 6 0 q3 -6 6 0 q3 -6 6 0" fill="none" stroke="${S === "automne" ? "#d9822b" : "#e2563d"}" stroke-width="2.4"/>`}`).join("")}`;
  if (h("ballon")) {
    const env = "M225 72 q-32 -20 -32 -44 a32 32 0 0 1 64 0 q0 24 -32 44z";
    const cols = ["#d8393f", "#f6d04a", "#2c5aa0", "#f6d04a", "#d8393f", "#f6d04a", "#2c5aa0", "#f6d04a"];
    const cx = i => (225 + (i / 4 - 1) * 64).toFixed(1);
    s += `<g transform="translate(0 8)"><defs><clipPath id="balloonenv"><path d="${env}"/></clipPath></defs>
    <g stroke="#4a3a2a" stroke-width=".9">${[[215,68,216,86],[235,68,234,86],[220,72,221,86],[230,72,229,86]].map(([x1,y1,x2,y2])=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`).join("")}</g>
    <g clip-path="url(#balloonenv)">${cols.map((c,i)=>`<path d="M225 -4 Q${cx(i)} 28 225 72 Q${cx(i+1)} 28 225 -4z" fill="${c}"/>`).join("")}
      <path d="M190 33 q35 9 70 0 v8 q-35 9 -70 0z" fill="#fff6d0"/>${[0,1,2,3,4,5,6,7,8].map(k=>`<path d="M${197+k*7} 37.4 l2.6 2.2 l-2.6 2.2 l-2.6 -2.2z" fill="#a8323a"/>`).join("")}
      <path d="M190 33 q35 9 70 0 M190 41 q35 9 70 0" fill="none" stroke="#c99a2e" stroke-width="1"/>
      <ellipse cx="251" cy="30" rx="15" ry="42" fill="#000" opacity=".2"/><ellipse cx="207" cy="12" rx="5" ry="15" fill="#fff" opacity=".4" transform="rotate(-14 207 12)"/><ellipse cx="203" cy="30" rx="2" ry="6" fill="#fff" opacity=".3"/></g>
    <path d="${env}" fill="none" stroke="#5a1a14" stroke-width="1.3" stroke-linejoin="round"/><circle cx="225" cy="-4" r="3" fill="#c99a2e" stroke="#7a5a12" stroke-width=".8"/>
    <path d="M214 68 h22 l-3 8 h-16z" fill="#a8323a" stroke="#5a1a14" stroke-width=".9" stroke-linejoin="round"/>
    <rect x="221" y="75" width="8" height="3" rx="1" fill="#4a4a4a"/><path d="M225 76 q-4.5 -5 0 -11 q4.5 6 0 11z" fill="#ff8a1a"/><path d="M225 75 q-2 -3 0 -6 q2 3 0 6z" fill="#ffe27a"/>
    <path d="M214 86 h22 l-1.6 12 q-9.4 2.4 -18.8 0z" fill="#b0763a" stroke="#5a3a1a" stroke-width="1"/>
    <path d="M215 90 h20 M215 94 h20 M219 86 v12 M225 86 v12 M231 86 v12" stroke="#7a4a1a" stroke-width=".8"/>
    <rect x="212" y="84" width="26" height="3.6" rx="1.8" fill="#8a5a2b" stroke="#5a3a1a" stroke-width=".8"/>
    <path d="M211 86 v6" stroke="#4a3a2a" stroke-width=".8"/><circle cx="211" cy="94" r="2.6" fill="#d8b878" stroke="#8a6a3a" stroke-width=".7"/><path d="M239 86 v6" stroke="#4a3a2a" stroke-width=".8"/><circle cx="239" cy="94" r="2.6" fill="#d8b878" stroke="#8a6a3a" stroke-width=".7"/></g>`;
  }
  if (h("arbre")) s += drawTree(S, S);
  if (h("cabane")) s += `<rect x="270" y="116" width="52" height="44" fill="#a0703f" stroke="#6b3f1d" stroke-width="2"/>${[276,282,288,294,300,306,312,318].map(x=>`<line x1="${x}" y1="118" x2="${x}" y2="158" stroke="#7b4f2a" stroke-width="1"/>`).join("")}
    <path d="M263 120 l33 -26 l33 26z" fill="#6b3f1d"/><path d="M269 118 q27 -22 54 0" fill="none" stroke="#4a2a12" stroke-width="1.2"/>${[102,108,114].map((y,i)=>`<path d="M${296-(y-94)*1.4} ${y} h${(y-94)*2.8}" stroke="#4a2a12" stroke-width="1.2"/>`).join("")}
    ${winter ? `<path d="M265 121 l31 -25 l31 25" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
    <rect x="286" y="130" width="18" height="30" fill="#5a3a1a"/><path d="M286 130 l18 30 M304 130 l-18 30" stroke="#3b2412" stroke-width="1.6"/>
    <rect x="274" y="126" width="10" height="10" fill="${winter ? "#ffe9a0" : "#9fd3f0"}" stroke="#3b2412" stroke-width="2"/><path d="M279 126 v10 M274 131 h10" stroke="#3b2412" stroke-width=".8"/>`;
  if (h("potager")) {
    s += `<path d="M138 130 h66 v3 h-66z M138 158 h66" stroke="#7b4f2a" stroke-width="0"/>`;
    [0, 1, 2].forEach(r => {
      const y = 131 + r * 9;
      s += `<rect x="138" y="${y}" width="66" height="8" rx="1.5" fill="${winter ? "#fff" : "#5a3a1f"}" stroke="#7b4f2a" stroke-width="1"/><rect x="138" y="${y + 6}" width="66" height="2.4" fill="#7b4f2a"/>`;
      for (let k = 0; k < 6; k++) {
        const x = 145 + k * 11;
        if (S === "printemps") s += `<path d="M${x} ${y + 5} q-3 -4 -4 -5 M${x} ${y + 5} q3 -4 4 -5" stroke="#4caf50" stroke-width="1.6" fill="none"/>`;
        else if (S === "ete") s += r === 0 ? `<path d="M${x-4} ${y+5} q4 -8 8 0z" fill="#7ac84a"/><path d="M${x-2} ${y+4} q2 -5 4 0" fill="#a5e070"/>` : r === 1 ? `<line x1="${x}" y1="${y+6}" x2="${x}" y2="${y-3}" stroke="#7b4f2a"/><circle cx="${x}" cy="${y}" r="3" fill="#e2563d"/><circle cx="${x-1}" cy="${y-1}" r=".8" fill="#fff"/>` : `<path d="M${x} ${y+5} l-3 -5 M${x} ${y+5} l0 -6 M${x} ${y+5} l3 -5" stroke="#4caf50" stroke-width="1.4" fill="none"/><circle cx="${x}" cy="${y+6}" r="1.6" fill="#f08a1f"/>`;
        else if (S === "automne") s += r === 1 ? `<ellipse cx="${x}" cy="${y+3}" rx="5" ry="4" fill="#f08a1f"/><path d="M${x-2} ${y} q2 5 0 7 M${x+2} ${y} q-2 5 0 7" stroke="#b8501f" stroke-width=".7" fill="none"/><path d="M${x} ${y-1} v-2" stroke="#4a6a2a" stroke-width="1.4"/>` : `<circle cx="${x}" cy="${y+3}" r="4" fill="#8ac06a"/><path d="M${x-3} ${y+3} q3 -4 6 0" stroke="#5a8a3a" stroke-width=".8" fill="none"/>`;
        else s += r === 1 ? `<path d="M${x} ${y+2} v-5 M${x-2} ${y+2} v-4 M${x+2} ${y+2} v-4" stroke="#6aa04a" stroke-width="1.6"/>` : `<ellipse cx="${x}" cy="${y+1}" rx="3.4" ry="2.4" fill="#fff" stroke="#bcd0e0" stroke-width=".6"/>`;
      }
    });
    s += `<rect x="135" y="126" width="3" height="34" fill="#5a3a1a"/><rect x="204" y="126" width="3" height="34" fill="#5a3a1a"/>`;
  }
  if (h("lampadaire")) s += `<ellipse cx="136" cy="200" rx="9" ry="3" fill="#1a1a1a"/><path d="M131 200 q5 -8 10 0z" fill="#2a2a2a"/><line x1="136" y1="124" x2="136" y2="198" stroke="#2a2a2a" stroke-width="4"/><rect x="132" y="150" width="8" height="3" fill="#3a3a3a"/><circle cx="136" cy="170" r="3" fill="#3a3a3a"/>
    <circle cx="136" cy="112" r="${winter || S === "automne" ? 20 : 14}" fill="#ffe27a" opacity=".28"/><path d="M127 124 h18 l-3 -14 h-12z" fill="#2a2a2a"/><path d="M129 122 h14 l-2 -11 h-10z" fill="#ffe9a0"/><path d="M126 110 l10 -8 l10 8z" fill="#2a2a2a"/><circle cx="136" cy="100" r="2.4" fill="#2a2a2a"/>${winter ? `<path d="M127 109 l9 -7 l9 7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` : ""}`;
  if (h("fontaine")) s += `<ellipse cx="195" cy="194" rx="36" ry="10" fill="#7e8a92"/><ellipse cx="195" cy="191" rx="34" ry="9" fill="#aab5bd"/><ellipse cx="195" cy="190" rx="28" ry="6.5" fill="${winter ? "#d6ecf8" : "#4a9ad8"}"/>
    ${winter ? `<path d="M175 190 l10 -3 M200 192 l12 -4 M188 193 l8 -2" stroke="#fff" stroke-width="1.2"/><ellipse cx="195" cy="189" rx="14" ry="2.6" fill="#fff"/>` : `<ellipse cx="195" cy="190" rx="20" ry="4" fill="#7cc4f0" opacity=".7"/>`}
    <rect x="190" y="164" width="10" height="26" fill="#aab5bd"/><rect x="190" y="164" width="3" height="26" fill="#c6d0d6"/><path d="M183 164 q12 4 24 0 l-3 -8 h-18z" fill="#9aa5ad"/><ellipse cx="195" cy="156" rx="16" ry="4.5" fill="#aab5bd"/><ellipse cx="195" cy="155" rx="12" ry="3" fill="${winter ? "#e8f4fb" : "#5aaae8"}"/><rect x="193" y="146" width="4" height="10" fill="#9aa5ad"/><circle cx="195" cy="145" r="3" fill="#aab5bd"/>
    ${winter ? `<path d="M195 142 l-3 -8 l3 3 l3 -3z" fill="#e8f4fb" stroke="#bcd0e0" stroke-width=".8"/>` : `<path d="M195 142 q-4 -14 -14 -8 q-4 2 -6 8 M195 142 q4 -14 14 -8 q4 2 6 8 M195 142 v-8" fill="none" stroke="#9ad8ff" stroke-width="2" stroke-linecap="round"/><path d="M181 134 v8 M209 134 v8 M175 142 l-2 6 M215 142 l2 6" stroke="#9ad8ff" stroke-width="1.4" opacity=".7" stroke-linecap="round"/>`}`;
  if (h("banc")) {
    const frame = `<path d="M238 160 q-2 18 0 36" fill="none" stroke="#222" stroke-width="3.4" stroke-linecap="round"/><path d="M247 183 q-.4 7 1.6 13" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/><path d="M236 182 h13" stroke="#222" stroke-width="2.6" stroke-linecap="round"/><path d="M235 178 q-2.4 -9 6 -9 q5 0 5 4.4 q0 3 -3 3" fill="none" stroke="#222" stroke-width="2.4" stroke-linecap="round"/><circle cx="243.4" cy="176.2" r="1.7" fill="#222"/><path d="M233 197 q5 -3.6 12 -.4 h3.4 q1.4 3.2 -3 3.2 h-10 q-4 0 -2.4 -2.8z" fill="#222"/><path d="M239 196 q4 -1 8 0" stroke="#555" stroke-width=".6" fill="none"/><circle cx="238" cy="172" r="1.2" fill="#555"/><circle cx="238" cy="184" r="1.1" fill="#555"/>`;
    s += `<ellipse cx="263" cy="199" rx="30" ry="2.4" fill="#000" opacity=".16"/>
    <path d="M286 190 h-46" stroke="#222" stroke-width="1.6"/>
    <g>${frame}</g><g transform="translate(526 0) scale(-1 1)">${frame}</g>
    <rect x="236" y="159" width="54" height="5.4" rx="1.2" fill="#8a5a2b"/><rect x="236" y="166" width="54" height="5.4" rx="1.2" fill="#9a6a38"/><rect x="236" y="176" width="54" height="4.4" rx="1.2" fill="#a0703f"/><rect x="236" y="181.4" width="54" height="3.6" rx="1.2" fill="#8a5a2b"/>
    <path d="M238 160.6 h50 M238 167.6 h50 M238 177.4 h50" stroke="#c99a6a" stroke-width=".8" opacity=".7"/><path d="M247 162 h9 M266 169 h12 M252 178 h14" stroke="#5a3a1a" stroke-width=".6" opacity=".6"/>${winter ? `<path d="M236 158 h54" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M237 175 h52" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` : ""}`;
  }
  if (h("niche")) s += `<rect x="298" y="172" width="42" height="28" fill="#c0392b" stroke="#7b241c" stroke-width="1.4"/>${[304,310,316,322,328,334].map(x=>`<line x1="${x}" y1="173" x2="${x}" y2="199" stroke="#9a2d22" stroke-width=".9"/>`).join("")}<path d="M293 174 l26 -18 l26 18z" fill="#7b241c" stroke="#5a1a14" stroke-width="1.2"/>${winter ? `<path d="M295 173 l24 -16 l24 16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` : ""}<path d="M310 200 v-14 a9 9 0 0 1 18 0 v14z" fill="#2a160a"/>
    <g transform="translate(330 186)"><path d="M4 6 q-7 -3 -6 -12" fill="none" stroke="#9a6d36" stroke-width="2.5" stroke-linecap="round"/><path d="M6 12 l-1 9 h3 l1 -8z M22 12 l1 9 h3 l-1 -9z" fill="#8a5d2c"/><path d="M3 8 q0 -6 8 -6 h11 q5 -1 7 -7 l6 1 q-1 8 -3 14 q-1 5 -6 6 h-17 q-6 0 -6 -8z" fill="#b5874a"/><path d="M8 14 q8 3 18 0" fill="none" stroke="#e0c08a" stroke-width="2"/><path d="M9 13 l0 8 h3 l1 -8z M25 13 l1 8 h3 l-1 -8z" fill="#b5874a"/><ellipse cx="31" cy="-5" rx="6" ry="5" fill="#b5874a"/><path d="M35 -8 q6 0 7 3 q0 3 -4 3 h-4z" fill="#c9a06a"/><circle cx="41.5" cy="-5.5" r="1.4" fill="#111"/><circle cx="33" cy="-7" r="1" fill="#111"/><path d="M28 -10 q-5 2 -3 10 q3 -1 5 -7z" fill="#6e4a22"/><path d="M27 1 q4 2 8 0" fill="none" stroke="#a8323a" stroke-width="1.5"/></g>
    <ellipse cx="350" cy="198" rx="5" ry="1.8" fill="#9aa5ad"/><path d="M345 198 q5 4 10 0z" fill="#c0392b"/>`;
  if (h("velo")) s += `<g transform="translate(350 190)" fill="none" stroke="#1f4e8a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="14" r="9" stroke="#1a1a1a" stroke-width="2.6"/><circle cx="38" cy="14" r="9" stroke="#1a1a1a" stroke-width="2.6"/>${[0,45,90,135].map(a=>{const dx=(7.5*Math.cos(a*Math.PI/180)).toFixed(1),dy=(7.5*Math.sin(a*Math.PI/180)).toFixed(1);return `<path d="M${(8-dx)} ${(14-dy)} L${(8+ +dx)} ${(14+ +dy)} M${(38-dx)} ${(14-dy)} L${(38+ +dx)} ${(14+ +dy)}" stroke="#9a9a9a" stroke-width=".6"/>`;}).join("")}
    <path d="M8 14 l12 -14 h14 l4 14 M20 0 l8 14 h-20 M34 0 l-2 -6 h-5"/><path d="M26 -2 h-8 q-2 -3 2 -4 h7" stroke="#2a2a2a" stroke-width="3"/><path d="M33 -7 l3 0 M30 -7 l3 -2" stroke="#2a2a2a" stroke-width="2.2"/><circle cx="28" cy="14" r="3.2" stroke="#2a2a2a" stroke-width="1.4"/><path d="M26 17 l-4 4 M30 11 l4 -4" stroke="#2a2a2a" stroke-width="2"/><circle cx="8" cy="14" r="1.6" fill="#1f4e8a" stroke="none"/><circle cx="38" cy="14" r="1.6" fill="#1f4e8a" stroke="none"/></g>`;
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
      <rect x="11" y="6" width="20" height="17" fill="#bfe3f0" stroke="#4a1216" stroke-width="1.5"/>
      <rect x="36" y="6" width="19" height="17" fill="#bfe3f0" stroke="#4a1216" stroke-width="1.5"/>
      <line x1="33.5" y1="6" x2="33.5" y2="38" stroke="#4a1216" stroke-width="1.5"/><circle cx="31.5" cy="29" r="1.2" fill="#c99a2e"/>
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
  if (h("fleurs")) s += drawFlowers(S);
  if (winter) s += [...Array(26)].map((_, k) => `<circle cx="${(k * 67 + 13) % 396 + 2}" cy="${(k * 41 + 7) % 214 + 3}" r="${k % 3 ? 1.4 : 2}" fill="#fff" opacity=".9"/>`).join("");
  if (S === "automne") s += [[40,150],[120,130],[170,140],[260,150],[310,135],[22,196],[150,206],[266,206]].map(([x,y],i)=>`<ellipse cx="${x}" cy="${y}" rx="3.6" ry="1.8" fill="${["#d9822b","#c0462a","#e8b030"][i%3]}" transform="rotate(${i*37} ${x} ${y})"/>`).join("");
  return s + "</svg>";
}

/* Professeur seul (petit portrait pour les énigmes). */
function drawPortrait(equipped){
  return `<svg viewBox="140 50 120 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${drawProfessor(equipped)}</svg>`;
}

if (typeof module !== "undefined") module.exports = { getCharStyle, setCharStyle, drawProfessor, ITEMS, SLOT_NAMES, DECOR_SLOTS, SEASONS, SEASON_NAMES, SKY_NAMES, seasonOf, skyIndexOf, drawScene, drawGarden, drawPortrait };
