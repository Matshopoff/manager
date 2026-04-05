const fs = require("fs");
const path = require("path");

const botsFile = path.join(__dirname, "../data/bots.json");

// Création auto du fichier si absent
if (!fs.existsSync(botsFile)) {
    fs.mkdirSync(path.dirname(botsFile), { recursive: true });
    fs.writeFileSync(botsFile, "{}");
}

function loadBots() {
    return JSON.parse(fs.readFileSync(botsFile, "utf8"));
}

function saveBots(data) {
    fs.writeFileSync(botsFile, JSON.stringify(data, null, 2));
}

module.exports = {
    // Retourne TOUS les bots
    getBots() {
        return loadBots();
    },

    // Retourne UN bot
    getBot(id) {
        const bots = loadBots();
        return bots[id] || null;
    },

    // Ajoute un bot (VERSION UNIQUE ET CORRECTE)
    addBot(owner, id, type, token, expireAt) {
        const bots = loadBots();

        bots[id] = {
            owner,
            type,
            token,
            expireAt
        };

        saveBots(bots);
    },

    // Supprime un bot
    deleteBot(id) {
        const bots = loadBots();
        delete bots[id];
        saveBots(bots);
    }
};
