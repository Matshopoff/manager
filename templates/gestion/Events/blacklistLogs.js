const { EmbedBuilder } = require("discord.js");
const db = require("../Events/loadDatabase");
const config = require("../config.json");
const sendLog = require("./sendlog");

module.exports = {
  name: "blacklistLogs",

  async execute(guild, userId, action) {
    try {
      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setDescription(`L’utilisateur <@${userId}> a été **${action}** de la blacklist.`)
        .setTimestamp();

      sendLog(guild, embed, "blacklist");
    } catch (err) {
      console.error("Erreur blacklistLogs :", err);
    }
  }
};
