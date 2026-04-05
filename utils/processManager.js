const { spawn } = require("child_process");
const path = require("path");

const NODE_PATH = "/usr/local/bin/node";
const NPM_PATH = "/usr/local/bin/npm";

const processes = new Map();

function getEntryPoint(type, botId) {
    if (type === "gestion")
        return path.join(__dirname, `../storage/bots/gestion/${botId}/index.js`);

    if (type === "inter")
        return path.join(__dirname, `../storage/bots/inter/${botId}/index.js`);

    return null;
}

module.exports = {
    startBot(botId, type) {
        const entry = getEntryPoint(type, botId);
        if (!entry) return false;

        if (processes.has(botId)) return false;

        const cwd = path.dirname(entry);

        console.log(`[PM] Installation des modules pour ${botId}...`);

        // 📦 INSTALLATION AUTOMATIQUE DES MODULES
        const installer = spawn(NPM_PATH, ["install"], {
            cwd,
            stdio: "inherit"
        });

        installer.on("close", () => {
            console.log(`[PM] Modules installés pour ${botId}, lancement...`);

            // 🚀 LANCEMENT DU BOT APRÈS INSTALLATION
            const child = spawn(NODE_PATH, [entry], {
                cwd,
                stdio: "inherit"
            });

            processes.set(botId, child);

            child.on("exit", () => {
                processes.delete(botId);
            });
        });

        return true;
    },

    stopBot(botId) {
        const child = processes.get(botId);
        if (!child) return false;

        child.kill();
        processes.delete(botId);
        return true;
    },

    restartBot(botId, type) {
        this.stopBot(botId);
        return this.startBot(botId, type);
    },

    isRunning(botId) {
        return processes.has(botId);
    }
};
