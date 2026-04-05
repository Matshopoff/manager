const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const db = require("../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("changetoken")
        .setDescription("Changer le token d'un bot")
        .addStringOption(o => o.setName("botid").setDescription("ID du bot").setRequired(true))
        .addStringOption(o => o.setName("token").setDescription("Nouveau token").setRequired(true)),

    async run(client, interaction) {
        const botId = interaction.options.getString("botid");
        const newToken = interaction.options.getString("token");

        const bot = db.getBot(botId);
        if (!bot) return interaction.reply({ content: "Bot introuvable.", ephemeral: true });

        fs.writeFileSync(`./storage/bots/${bot.type}/${botId}/token.txt`, newToken);
        db.updateToken(botId, newToken);

        interaction.reply(`Token du bot **${botId}** mis à jour.`);
    }
};
