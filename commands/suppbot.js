const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("suppbot")
        .setDescription("Supprimer un bot enfant")
        .addStringOption(opt =>
            opt.setName("botid")
                .setDescription("ID du bot enfant")
                .setRequired(true)
        ),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ Tu n'as pas la permission.", ephemeral: true });
        }

        const botId = interaction.options.getString("botid");

        const botsPath = path.join(__dirname, "../../data/bots.json");
        let bots = JSON.parse(fs.readFileSync(botsPath, "utf8"));

        if (!bots[botId]) {
            return interaction.reply({ content: "❌ Ce bot n'existe pas.", ephemeral: true });
        }

        const type = bots[botId].type;
        const botFolder = path.join(__dirname, `../../storage/bots/${type}/${botId}`);

        // Suppression du dossier
        await fse.remove(botFolder);

        // Suppression de l'entrée dans bots.json
        delete bots[botId];
        fs.writeFileSync(botsPath, JSON.stringify(bots, null, 2));

        interaction.reply(`🗑️ Bot **${botId}** supprimé.`);
    }
};
