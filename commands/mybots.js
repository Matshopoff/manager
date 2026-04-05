const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mybots")
        .setDescription("Affiche la liste de vos bots"),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Chargement du bots.json
        const botsPath = path.join(__dirname, "../data/bots.json");
        const bots = JSON.parse(fs.readFileSync(botsPath, "utf8"));

        // Filtrer les bots appartenant à l'utilisateur
        const userBots = Object.entries(bots)
            .filter(([id, data]) => data.owner === userId)
            .map(([id, data]) => ({ id, ...data }));

        if (userBots.length === 0) {
            return interaction.reply({
                content: "❌ Vous n'avez aucun bot.",
                flags: 64
            });
        }

// Menu déroulant
const menu = new StringSelectMenuBuilder()
    .setCustomId("select_bot")
    .setPlaceholder("Sélectionnez un bot")
    .addOptions(
        await Promise.all(
            userBots.map(async bot => {
                const botUser = await interaction.client.users.fetch(bot.id).catch(() => null);
                const botName = botUser ? botUser.username : "Bot inconnu";

                return {
                    label: botName,   // ✔ NOM DU BOT
                    value: bot.id     // ✔ ID utilisé pour la sélection
                };
            })
        )
    );

        const row = new ActionRowBuilder().addComponents(menu);

        const embed = new EmbedBuilder()
            .setColor("#2ecc71")
            .setTitle("📋 Sélectionnez un bot")
            .setDescription("Choisissez un bot dans le menu déroulant ci-dessous.")
            .setTimestamp();

        interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
