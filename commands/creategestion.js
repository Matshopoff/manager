const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const db = require("../utils/db");
const copyFolder = require("../utils/fileCopy");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("creategestion")
        .setDescription("Créer un bot gestion")
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
        const botId = interaction.options.getString("id"); // ✔ ID fourni par l’utilisateur

        const dest = `./storage/bots/gestion/${botId}`;
        const template = `./templates/gestion`;

        // Copier les fichiers
        copyFolder(template, dest);

        // Écrire le token
        fs.writeFileSync(`${dest}/token.txt`, token);

        // Modifier config.json
        const configPath = `${dest}/config.json`;
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

        config.owners = [interaction.user.id];
        config.token = ""; // on vide le token

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        // Expiration dans 30 jours
        const expireAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

        // Ajouter à la base
        db.addBot(interaction.user.id, botId, "gestion", token, expireAt);

        interaction.reply(`Bot gestion créé avec l'ID **${botId}**`);
    }
};
