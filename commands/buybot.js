const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("buybot")
        .setDescription("Acheter un bot"),

    async run(client, interaction) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("buy_gestion")
                .setLabel("Acheter un bot Gestion")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("buy_school")
                .setLabel("Acheter un bot School")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("buy_inter")
                .setLabel("Acheter un bot Inter-Serveur")
                .setStyle(ButtonStyle.Secondary)
        );

        interaction.reply({
            content: "Choisissez le type de bot que vous souhaitez acheter :",
            components: [row]
        });
    }
};
