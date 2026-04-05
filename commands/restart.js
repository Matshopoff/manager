const { SlashCommandBuilder } = require("discord.js");
const db = require("../utils/db");
const pm = require("../utils/processManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("restart")
        .setDescription("Redémarre un bot enfant")
        .addStringOption(o => o.setName("botid").setDescription("ID du bot").setRequired(true)),

    async run(client, interaction) {
        const botId = interaction.options.getString("botid");
        const bot = db.getBot(botId);

        if (!bot) return interaction.reply({ content: "Bot introuvable.", ephemeral: true });

        if (pm.startBot(botId, bot.type)) {
            interaction.reply(`Le bot **${botId}** a été redémarré.`);
        } else {
            interaction.reply({ content: "Le bot est déjà en cours d'exécution.", ephemeral: true });
        }
    }
};
