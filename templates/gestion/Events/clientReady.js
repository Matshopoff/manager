const { ActivityType } = require("discord.js");

module.exports = {
    name: "clientReady",
    once: true,
    async execute(bot) {

        console.log(`[INFO] > ${bot.user.tag} est connecté`);

        bot.user.setPresence({
            activities: [
                {
                    name: "la gestion",
                    type: ActivityType.Playing,
                    url: "https://twitch.tv/4wipyk"
                }
            ],
            status: "dnd"
        });

        try {
            if (bot.loadCustomCommands) bot.loadCustomCommands();
            if (bot.loadHelpCategories) bot.loadHelpCategories();
            if (bot.loadPermissions) bot.loadPermissions();
            if (bot.loadVariables) bot.loadVariables();
        } catch (err) {
            console.log("[ERROR] Initialisation modules internes :", err);
        }
    }
};
