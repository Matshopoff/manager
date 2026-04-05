const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");
const sendLog = require("./sendlog");

module.exports = {
  name: "guildUpdate",

  async execute(oldGuild, newGuild) {
    try {
      const changes = [];

      if (oldGuild.name !== newGuild.name)
        changes.push(`🏷️ **Nom :** \`${oldGuild.name}\` → \`${newGuild.name}\``);

      if (oldGuild.icon !== newGuild.icon)
        changes.push(`🖼️ **Icône modifiée**`);

      if (oldGuild.banner !== newGuild.banner)
        changes.push(`🎨 **Bannière modifiée**`);

      if (changes.length === 0) return;

      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle("🔧 Mise à jour du serveur")
        .setDescription(changes.join("\n"))
        .setTimestamp();

      sendLog(newGuild, embed, "serverlog");
    } catch (err) {
      console.error("Erreur guildUpdate :", err);
    }
  }
};
