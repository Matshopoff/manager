const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const db = require("../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("claim")
        .setDescription("Ajoute du temps à un bot via une clé")
        .addStringOption(o =>
            o.setName("botid")
             .setDescription("ID du bot")
             .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("clé")
             .setDescription("Clé d'extension")
             .setRequired(true)
        ),

    async run(client, interaction) {
        const botId = interaction.options.getString("botid");
        const key = interaction.options.getString("clé");

        const bot = db.getBot(botId);
        if (!bot)
            return interaction.reply({ content: "❌ Bot introuvable.", ephemeral: true });

        if (bot.owner !== interaction.user.id)
            return interaction.reply({ content: "❌ Ce bot ne vous appartient pas.", ephemeral: true });

        // Charger les clés
        const keysPath = "./data/keys.json";
        if (!fs.existsSync(keysPath))
            return interaction.reply({ content: "❌ Aucune clé disponible.", ephemeral: true });

        const keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));

        // Vérifier la clé
        if (!keys[key])
            return interaction.reply({ content: "❌ Clé invalide ou déjà utilisée.", ephemeral: true });

        const duration = keys[key].duration; // en jours

        // Supprimer la clé (consommée)
        delete keys[key];
        fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));

        // Ajouter du temps
        const now = Date.now();
        const currentExpire = bot.expireAt || now;
        const newExpire = currentExpire + duration * 24 * 60 * 60 * 1000;

        // Mise à jour DB
        const bots = db.getBots();
        bots[botId].expireAt = newExpire;
        db.saveBots(bots);

        interaction.reply({
            content: `⏳ Temps ajouté !  
Nouvelle expiration : <t:${Math.floor(newExpire / 1000)}:R>`,
            ephemeral: true
        });
    }
};
