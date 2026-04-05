const db = require("./db");
const pm = require("./processManager");

module.exports = (client) => {
    console.log("⏳ Surveillance des licences activée...");

    setInterval(() => {
        const bots = db.getBots();

        for (const botId in bots) {
            const bot = bots[botId];

            if (bot.expires && bot.expires < Date.now()) {
                if (pm.isRunning(botId)) {
                    pm.stopBot(botId);
                    console.log(`❌ Licence expirée → bot ${botId} arrêté`);
                }
            }
        }
    }, 5000);
};
