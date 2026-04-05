const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");

module.exports = {
  name: "interactionCreate",

  async execute(interaction, bot) {
    try {
      // Slash commands
      if (interaction.isChatInputCommand()) {
        const cmd = bot.commands.get(interaction.commandName);
        if (!cmd) return;

        try {
          await cmd.execute(interaction, bot);
        } catch (err) {
          console.error("Erreur commande :", err);

          const embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ Une erreur est survenue lors de l’exécution de la commande.");

          if (!interaction.replied) {
            await interaction.reply({ embeds: [embed], ephemeral: true });
          }
        }
      }

      // Buttons
      if (interaction.isButton()) {
        const btn = bot.buttons?.get(interaction.customId);
        if (btn) btn.execute(interaction, bot);
      }

      // Menus
      if (interaction.isStringSelectMenu()) {
        const menu = bot.menus?.get(interaction.customId);
        if (menu) menu.execute(interaction, bot);
      }
    } catch (err) {
      console.error("Erreur interactionCreate :", err);
    }
  }
};
