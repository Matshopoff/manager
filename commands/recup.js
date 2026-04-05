const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const db = require("../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("recup")
        .setDescription("Génère ou utilise un code de transfert")
        .addStringOption(o =>
            o.setName("botid")
             .setDescription("ID du bot à transférer (laisser vide si vous utilisez un code)")
             .setRequired(false)
        )
        .addStringOption(o =>
            o.setName("code")
             .setDescription("Code de transfert reçu")
             .setRequired(false)
        ),

    async run(client, interaction) {
        const botId = interaction.options.getString("botid");
        const codeInput = interaction.options.getString("code");

        const codesPath = "./data/recup.json";
        let codes = {};

        if (fs.existsSync(codesPath)) {
            codes = JSON.parse(fs.readFileSync(codesPath, "utf8"));
        }

        // ---------------------------
        // 🔄 MODE 1 : UTILISER UN CODE
        // ---------------------------
        if (codeInput) {
            if (!codes[codeInput]) {
                return interaction.reply({ content: "❌ Code invalide ou expiré.", ephemeral: true });
            }

            const data = codes[codeInput];

            // Mise à jour du propriétaire
            const bots = db.getBots();
            if (!bots[data.botId]) {
                return interaction.reply({ content: "❌ Le bot lié à ce code n'existe plus.", ephemeral: true });
            }

            bots[data.botId].owner = interaction.user.id;
            db.saveBots(bots);

            // Suppression du code
            delete codes[codeInput];
            fs.writeFileSync(codesPath, JSON.stringify(codes, null, 2));

            return interaction.reply({
                content: `✅ Vous êtes maintenant propriétaire du bot **${data.botId}**`,
                ephemeral: true
            });
        }

        // ---------------------------
        // 🔄 MODE 2 : GÉNÉRER UN CODE
        // ---------------------------
        if (!botId) {
            return interaction.reply({
                content: "❌ Vous devez fournir un botid ou un code.",
                ephemeral: true
            });
        }

        const bot = db.getBot(botId);

        if (!bot)
            return interaction.reply({ content: "❌ Bot introuvable.", ephemeral: true });

        if (bot.owner !== interaction.user.id)
            return interaction.reply({ content: "❌ Ce bot ne vous appartient pas.", ephemeral: true });

        // Génération du code
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();

        // Stockage
        codes[code] = {
            botId,
            owner: interaction.user.id,
            type: bot.type,
            token: bot.token,
            expireAt: bot.expireAt,
            createdAt: bot.createdAt
        };

        fs.writeFileSync(codesPath, JSON.stringify(codes, null, 2));

        return interaction.reply({
            content: `🔐 Code de transfert généré : **${code}**\nDonnez-le à la personne qui doit récupérer le bot.`,
            ephemeral: true
        });
    }
};
