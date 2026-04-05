const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");
const sendLog = require("./sendlog");

module.exports = {
  name: "guildMemberAdd",

  async execute(member) {
    try {
      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setDescription(
          `👤 **Nouveau membre :** <@${member.id}>\nID : \`${member.id}\``
        )
        .setTimestamp();

      sendLog(member.guild, embed, "joinlog");
    } catch (err) {
      console.error("Erreur guildMemberAdd :", err);
    }
  }
};
