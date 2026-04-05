const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

module.exports = (client) => {
    const botsPath = path.join(__dirname, "../data/bots.json");

    if (!fs.existsSync(botsPath)) {
        console.log("[CHILD MANAGER] ❌ Aucun fichier bots.json trouvé.");
        return;
    }

    let bots = JSON.parse(fs.readFileSync(botsPath, "utf8"));

    console.log(`[CHILD MANAGER] ${Object.keys(bots).length} bots trouvés.`);

    for (const botId of Object.keys(bots)) {
        const botData = bots[botId];
        const type = botData.type;

        const botFolder = path.join(__dirname, `../storage/bots/${type}/${botId}`);
        const botIndex = path.join(botFolder, "index.js");

        if (!fs.existsSync(botIndex)) {
            console.log(`[CHILD ${botId}] ❌ index.js introuvable, bot ignoré.`);
            continue;
        }

        console.log(`[CHILD ${botId}] Lancement du bot enfant...`);

        const child = spawn("node", [botIndex], {
            cwd: botFolder,
            stdio: "inherit"
        });

        child.on("exit", (code) => {
            console.log(`[CHILD ${botId}] ⚠️ Bot arrêté (code ${code}). Relancement dans 5 secondes...`);
            setTimeout(() => {
                spawn("node", [botIndex], {
                    cwd: botFolder,
                    stdio: "inherit"
                });
            }, 5000);
        });
    }
};
