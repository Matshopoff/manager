const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addtime")
        .setDescription("Ajouter du temps à un bot enfant")
        .addStringOption(opt =>
            opt.setName("botid")
                .setDescription("ID du bot enfant")
                .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName("jours")
                .setDescription("Nombre de jours à ajouter")
                .setRequired(true)
        ),

    async execute(interaction) {

        // Vérification permission admin
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ Tu n'as pas la permission.", ephemeral: true });
        }

        const botId = interaction.options.getString("botid");
        const daysToAdd = interaction.options.getInteger("jours");

        const botsPath = path.join(__dirname, "../data/bots.json");

        if (!fs.existsSync(botsPath)) {
            return interaction.reply("❌ Le fichier bots.json est introuvable.");
        }

        let bots = JSON.parse(fs.readFileSync(botsPath, "utf8"));

        if (!bots[botId]) {
            return interaction.reply("❌ Ce bot n'existe pas dans la base de données.");
        }

        // Ajout du temps
        const currentExpire = bots[botId].expireAt || Date.now();
        const newExpire = currentExpire + daysToAdd * 24 * 60 * 60 * 1000;

        bots[botId].expireAt = newExpire;

        fs.writeFileSync(botsPath, JSON.stringify(bots, null, 2));

        const date = new Date(newExpire).toLocaleString("fr-FR");

        interaction.reply(
            `⏳ Temps ajouté au bot **${botId}** !\n` +
            `📌 **+${daysToAdd} jours**\n` +
            `📅 Nouvelle expiration : **${date}**`
        );
    }
};
