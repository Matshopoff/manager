const { SlashCommandBuilder } = require("discord.js");
const pm = require("../utils/processManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Arrête un bot enfant")
        .addStringOption(o => o.setName("botid").setDescription("ID du bot").setRequired(true)),

    async run(client, interaction) {
        const botId = interaction.options.getString("botid");

        if (pm.stopBot(botId)) {
            interaction.reply(`Le bot **${botId}** a été arrêté.`);
        } else {
            interaction.reply({ content: "Ce bot n'est pas en cours d'exécution.", ephemeral: true });
        }
    }
};
