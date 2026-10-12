/* Test de bout en bout dans un vrai navigateur (Chromium via Playwright).
   Lancer : npx -y playwright install chromium   (une seule fois)
            PLAYWRIGHT=$(dirname $(find ~/.npm/_npx -path '*node_modules/playwright/package.json' | head -1)) node test/e2e.js
   Démarre un petit serveur local, joue, sauvegarde dans un fichier, recharge ce fichier dans un navigateur vierge. */
const assert = require("assert");
const http = require("http"), fs = require("fs"), path = require("path"), os = require("os");
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const root = path.join(__dirname, "..");

const server = http.createServer((req, res) => {
  const f = path.join(root, req.url === "/" ? "index.html" : req.url.split("?")[0]);
  fs.readFile(f, (err, data) => { if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": f.endsWith(".js") ? "text/javascript" : "text/html; charset=utf-8" }); res.end(data); });
}).listen(0);
const url = `http://localhost:${server.address().port}/`;

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const open = async () => {
    const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 412, height: 900 } });
    const p = await ctx.newPage();
    p.on("pageerror", e => errors.push(e.message));
    p.on("dialog", d => d.accept());
    await p.goto(url);
    return p;
  };

  // 1. Écran titre
  let p = await open();
  assert.strictEqual(await p.textContent(".title-logo .t1"), "Plume & Cie");
  assert.match(await p.textContent(".title-buttons"), /Nouvelle enquête/);
  console.log("ok - écran titre (nouvelle partie)");

  // 2. Jouer : résoudre le mystère 1 en touchant les 3 fautes, puis acheter un objet
  await p.click("text=Nouvelle enquête");
  await p.click("text=Mystère 1");
  // touche chaque mot fautif (marqué [faute|correction] dans les données)
  const badIdx = await p.evaluate(() => PUZZLES[0].text.split(" ").map((w, i) => w.startsWith("[") ? i : -1).filter(i => i >= 0));
  assert.strictEqual(badIdx.length, 3);
  for (const i of badIdx) await p.locator(".w").nth(i).click();
  await p.click("text=Valider");
  assert.strictEqual(await p.textContent(".big"), "Bravo !");
  await p.click(".overlay >> text=Maison");
  await p.click("text=Boutique");
  await p.click(".shop-item:has-text('Nœud papillon') button");
  const coins = await p.evaluate(() => JSON.parse(localStorage.getItem("plume-save-v2")).coins);
  assert.strictEqual(coins, 5 + 15 - 20);
  console.log("ok - partie jouée : mystère 1 résolu, nœud papillon acheté");

  // 3. Sauvegarder dans un fichier
  await p.click("text=⟵ Maison");
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click("text=💾 Sauvegarder")]);
  const file = path.join(os.tmpdir(), dl.suggestedFilename());
  await dl.saveAs(file);
  const content = JSON.parse(fs.readFileSync(file, "utf8"));
  assert.match(dl.suggestedFilename(), /^plume-et-cie-sauvegarde-\d{4}-\d\d-\d\d\.json$/);
  assert.deepStrictEqual([content.solved, content.owned, content.equipped, content.coins], [[0], ["noeud"], { neck: "noeud" }, 0]);
  console.log("ok - fichier téléchargé :", dl.suggestedFilename());

  // 4. Navigateur vierge (autre appareil) : charger le fichier depuis l'écran titre
  p = await open();
  assert.match(await p.textContent(".title-buttons"), /Nouvelle enquête/);
  const [chooser] = await Promise.all([p.waitForEvent("filechooser"), p.click("text=Charger une sauvegarde")]);
  await chooser.setFiles(file);
  await p.waitForSelector(".progress");
  assert.match(await p.textContent("body"), /1 \/ 50 mystères résolus/);
  assert.match(await p.textContent(".money"), /0 écus/);
  assert.ok(await p.$("text=Mystère 2"), "mystère 2 débloqué");
  await p.click("text=Boutique");
  assert.strictEqual(await p.textContent(".shop-item:has-text('Nœud papillon') button"), "Retirer");
  console.log("ok - sauvegarde rechargée dans un navigateur vierge (mystères + objets portés)");

  // 5. Fichier invalide : message d'erreur, progression intacte
  const badFile = path.join(os.tmpdir(), "pas-une-sauvegarde.json");
  fs.writeFileSync(badFile, '{"hello":1}');
  let alertMsg = "";
  p.removeAllListeners("dialog");
  p.on("dialog", d => { alertMsg = d.message(); d.accept(); });
  await p.click("text=⟵ Maison");
  const [ch2] = await Promise.all([p.waitForEvent("filechooser"), p.click("text=📂 Charger")]);
  await ch2.setFiles(badFile);
  await p.waitForTimeout(500);
  assert.match(alertMsg, /pas une sauvegarde/);
  assert.match(await p.textContent("body"), /1 \/ 50 mystères résolus/);
  console.log("ok - fichier invalide refusé, progression conservée");

  // 6. Écran titre en mode "Continuer"
  await p.reload();
  assert.match(await p.textContent(".title-buttons"), /Continuer/);
  console.log("ok - écran titre (continuer)");

  assert.deepStrictEqual(errors, [], "erreurs JS");
  console.log("\nTests navigateur OK");
  await browser.close(); server.close();
})().catch(e => { console.error(e); process.exit(1); });
