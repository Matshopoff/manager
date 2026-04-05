const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");
const sendLog = require("./sendlog");

module.exports = {
  name: "presenceUpdate",

  async execute(oldPresence, newPresence) {
    try {
      if (!newPresence || !newPresence.guild) return;

      const oldStatus = oldPresence?.status || "offline";
      const newStatus = newPresence.status;

      if (oldStatus === newStatus) return;

      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setDescription(
          `🟢 **Changement de statut pour <@${newPresence.user.id}>**\n` +
          `\`${oldStatus}\` → \`${newStatus}\``
        )
        .setTimestamp();

      sendLog(newPresence.guild, embed, "memberlog");
    } catch (err) {
      console.error("Erreur presenceUpdate :", err);
    }
  }
};
