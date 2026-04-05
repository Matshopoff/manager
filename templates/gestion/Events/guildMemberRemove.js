const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const config = require("../config.json");
const sendLog = require("./sendlog");

module.exports = {
  name: "guildMemberRemove",

  async execute(member) {
    const guild = member.guild;

    try {
      const logs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick
      });

      const entry = logs.entries.first();
      const executor = entry?.executor;

      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTimestamp();

      if (executor && entry.target.id === member.id) {
        embed.setDescription(
          `👢 <@${executor.id}> a expulsé **${member.user.tag}** (${member.id})`
        );
      } else {
        embed.setDescription(
          `👋 **${member.user.tag}** (${member.id}) a quitté le serveur`
        );
      }

      sendLog(guild, embed, "leavelog");
    } catch (err) {
      console.error("Erreur guildMemberRemove :", err);
    }
  }
};
