const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");
const sendLog = require("./sendlog");

module.exports = {
  name: "messageDelete",

  async execute(message) {
    try {
      if (!message.guild || message.author?.bot) return;

      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setDescription(
          `🗑️ **Message supprimé dans <#${message.channel.id}>**\n` +
          `Auteur : <@${message.author.id}>\n\n` +
          `\`\`\`\n${message.content || "Aucun contenu"}\n\`\`\``
        )
        .setTimestamp();

      sendLog(message.guild, embed, "msglog");
    } catch (err) {
      console.error("Erreur messageDelete :", err);
    }
  }
};
