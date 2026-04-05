const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");
const sendLog = require("./sendlog");

module.exports = {
  name: "messageUpdate",

  async execute(oldMessage, newMessage) {
    try {
      if (!newMessage.guild || newMessage.author?.bot) return;
      if (oldMessage.content === newMessage.content) return;

      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setDescription(
          `✏️ **Message modifié dans <#${newMessage.channel.id}>**\n` +
          `Auteur : <@${newMessage.author.id}>\n\n` +
          `**Avant :**\n\`\`\`\n${oldMessage.content || "Aucun"}\n\`\`\`\n` +
          `**Après :**\n\`\`\`\n${newMessage.content || "Aucun"}\n\`\`\``
        )
        .setTimestamp();

      sendLog(newMessage.guild, embed, "msglog");
    } catch (err) {
      console.error("Erreur messageUpdate :", err);
    }
  }
};
