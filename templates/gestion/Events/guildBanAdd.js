const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const db = require("../Events/loadDatabase");
const config = require("../config.json");
const sendLog = require("./sendlog");

module.exports = {
  name: "guildBanAdd",

  async execute(ban) {
    const guild = ban.guild;

    try {
      const logs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd
      });

      const entry = logs.entries.first();
      if (!entry) return;

      const executor = entry.executor;

      const embed = new EmbedBuilder()
        .setColor(config.color)
        .setDescription(
          `<@${executor.id}> a banni **${ban.user.tag}** (${ban.user.id})`
        )
        .setTimestamp();

      sendLog(guild, embed, "banlog");
    } catch (err) {
      console.error("Erreur guildBanAdd :", err);
    }
  }
};
