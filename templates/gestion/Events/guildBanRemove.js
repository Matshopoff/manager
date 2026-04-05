const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const config = require("../config.json");
const sendLog = require("./sendlog");

module.exports = {
  name: "guildBanRemove",

  async execute(ban) {
    const guild = ban.guild;

    try {
      const logs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanRemove
      });

      const entry = logs.entries.first();
      if (!entry) return;

      const executor = entry.executor;

      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setDescription(
          `<@${executor.id}> a débanni **${ban.user.tag}** (${ban.user.id})`
        )
        .setTimestamp();

      sendLog(guild, embed, "banlog");
    } catch (err) {
      console.error("Erreur guildBanRemove :", err);
    }
  }
};
