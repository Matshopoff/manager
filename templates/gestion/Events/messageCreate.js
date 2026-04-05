const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");
const sendLog = require("./sendlog");

module.exports = {
  name: "messageCreate",

  async execute(message, bot) {
    try {
      if (!message.guild || message.author.bot) return;

      // Logs messages
      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setDescription(
          `💬 **Message envoyé dans <#${message.channel.id}>**\n` +
          `Auteur : <@${message.author.id}>\n\n` +
          `\`\`\`\n${message.content || "Aucun contenu"}\n\`\`\``
        )
        .setTimestamp();

      sendLog(message.guild, embed, "msglog");

      // Commandes prefix
      const prefix = config.prefix || "!";
      if (!message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const cmdName = args.shift().toLowerCase();

      const cmd =
        bot.commands.get(cmdName) || bot.commands.get(bot.aliases.get(cmdName));
      if (!cmd) return;

      cmd.execute(message, args, bot);
    } catch (err) {
      console.error("Erreur messageCreate :", err);
    }
  }
};
