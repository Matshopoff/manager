const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

module.exports = {
    name: "clientReady",
    once: true,
    execute(client) {
        console.log("[PARENT] Démarrage du manager de bots enfants...");

        const botsPath = "./storage/bots/gestion";

        // 🔥 Fonction pour mettre à jour le statut
        const updateStatus = () => {
            let botsCount = 0;

            if (fs.existsSync(botsPath)) {
                botsCount = fs.readdirSync(botsPath).filter(f =>
                    fs.lstatSync(path.join(botsPath, f)).isDirectory()
                ).length;
            }

            const clientsCount = client.guilds.cache.size;

            client.user.setActivity(
                `Regarde ${botsCount} bots & ${clientsCount} clients`,
                { type: 3 } // WATCHING
            );
        };

        // Mise à jour immédiate au démarrage
        updateStatus();

        // Mise à jour toutes les minutes
        setInterval(updateStatus, 60_000);

        // --- Lancement des bots enfants ---
        if (!fs.existsSync(botsPath)) {
            console.log("[PARENT] Aucun dossier de bots enfants trouvé.");
            return;
        }

        const bots = fs.readdirSync(botsPath).filter(f =>
            fs.lstatSync(path.join(botsPath, f)).isDirectory()
        );

        if (bots.length === 0) {
            console.log("[PARENT] Aucun bot enfant à lancer.");
            return;
        }

        const children = {};

        const startChild = (botId) => {
            const botFolder = path.join(botsPath, botId);
            const tokenFile = path.join(botFolder, "token.txt");

            if (!fs.existsSync(tokenFile)) {
                console.log(`[PARENT] Pas de token pour ${botId}, ignoré.`);
                return;
            }

            const token = fs.readFileSync(tokenFile, "utf8").trim();
            if (!token) {
                console.log(`[PARENT] Token vide pour ${botId}, ignoré.`);
                return;
            }

            console.log(`[PARENT] Lancement du bot enfant ${botId}...`);

            const child = exec(`node index.js`, { cwd: botFolder });

            children[botId] = child;

            child.stdout.on("data", data => {
                console.log(`[CHILD ${botId}] ${data}`);
            });

            child.stderr.on("data", data => {
                console.log(`[CHILD ${botId} ERROR] ${data}`);
            });

            child.on("exit", code => {
                console.log(`[CHILD ${botId}] Processus terminé (code ${code}). Redémarrage dans 3s...`);
                setTimeout(() => startChild(botId), 3000);
            });
        };

        bots.forEach(botId => startChild(botId));
    }
};
