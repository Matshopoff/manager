const { SlashCommandBuilder } = require("discord.js");
const db = require("../utils/db");
const pm = require("../utils/processManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("start")
        .setDescription("Démarre un bot enfant")
        .addStringOption(o =>
            o.setName("botid")
             .setDescription("ID du bot")
             .setRequired(true)
        ),

    async execute(interaction) {
        const botId = interaction.options.getString("botid");
        const bot = db.getBot(botId);

        if (!bot) {
            return interaction.reply({ content: "❌ Bot introuvable.", flags: 64 });
        }

        const started = pm.startBot(botId, bot.type);

        if (started) {
            interaction.reply(`🚀 Le bot **${botId}** a été démarré.`);
        } else {
            interaction.reply({ content: "⚠️ Le bot est déjà en cours d'exécution.", flags: 64 });
        }
    }
};
