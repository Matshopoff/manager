const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const db = require("../utils/db");
const copyFolder = require("../utils/fileCopy");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("createinter")
        .setDescription("Créer un bot inter-serveur")
        .addStringOption(o =>
            o.setName("token")
             .setDescription("Token du bot")
             .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("clé")
             .setDescription("Clé d'activation")
             .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("id")
             .setDescription("ID du bot")
             .setRequired(true)
        ),

    async execute(interaction, client) {
        const token = interaction.options.getString("token");
        const key = interaction.options.getString("clé");
        const botId = interaction.options.getString("id");

        const dest = `./storage/bots/inter/${botId}`;
        const template = `./templates/inter`;

        copyFolder(template, dest);

        fs.writeFileSync(`${dest}/token.txt`, token);

        // Expiration dans 30 jours
        const expireAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

        // Ajouter à la base
        db.addBot(interaction.user.id, botId, "inter", token, expireAt);

        interaction.reply(`Bot inter-serveur créé avec l'ID **${botId}**`);
    }
};
