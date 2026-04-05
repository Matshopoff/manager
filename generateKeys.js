const fs = require("fs");
const path = require("path");

const keysPath = path.join(__dirname, "data/keys.json");

// Caractères autorisés
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+?";

// Génère une clé de 8 caractères
function generateKey() {
  let key = "";
  for (let i = 0; i < 8; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

// Charge les clés existantes
let keys = {};
if (fs.existsSync(keysPath)) {
  keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));
}

// Génère 100 nouvelles clés
for (let i = 0; i < 100; i++) {
  const newKey = generateKey();

  keys[newKey] = {
    days: 30,
    used: false,
    guild: null,
    activatedAt: null
  };
}

// Sauvegarde
fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));

console.log("✔ 100 clés générées !");
