const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

function formatDate(ts) {
    return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(ts);
}

function timeLeft(ts) {
    const diff = ts - Date.now();
    if (diff <= 0) return "expiré";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return "moins d’un jour";
    if (days === 1) return "1 jour";
    if (days < 30) return `${days} jours`;

    const months = Math.floor(days / 30);
    return `${months} mois`;
}

module.exports = {
    id: "select_bot",

    async execute(interaction, client) {
        const botId = interaction.values[0];

        const botsPath = path.join(__dirname, "../data/bots.json");
        const bots = JSON.parse(fs.readFileSync(botsPath, "utf8"));

        const bot = bots[botId];
        if (!bot) {
            return interaction.update({
                content: "❌ Bot introuvable.",
                embeds: [],
                components: []
            });
        }

        const botUser = await client.users.fetch(botId).catch(() => null);
        const botName = botUser ? botUser.username : "Bot inconnu";

        const status = bot.expireAt > Date.now()
            ? "<a:1330653866727047251:1466947692113694852> Actif"
            : "<a:1407124349303132212:1466947704663052450> Expiré";

        const inviteLink = `https://discord.com/oauth2/authorize?client_id=${botId}&scope=bot%20applications.commands&permissions=8`;
        const clickable = `[➕ Ajouter ${botName}](${inviteLink})`;

        const embed = new EmbedBuilder()
            .setColor("#2ecc71")
            .setTitle(`🤖 ${botName}`)
            .setDescription(
                `${clickable}\n\n` +
                `**${status}**\n` +
                `📅 **Expire le :** ${formatDate(bot.expireAt)}\n` +
                `⏳ **dans ${timeLeft(bot.expireAt)}**\n` +
                `🆔 **ID :** ${botId}`
            )
            .setTimestamp();

        // IMPORTANT : on utilise update() pour garder le menu actif
        return interaction.update({
            embeds: [embed],
            components: interaction.message.components
        });
    }
};
