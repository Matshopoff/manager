const {
  EmbedBuilder,
  AuditLogEvent
} = require("discord.js");

const db = require("../Events/loadDatabase");
const config = require("../config.json");
const sendLog = require("./sendlog");

// Vérifie si l'utilisateur est owner/whitelist
const bypass = async (userId) => {
  if (config.owners && config.owners.includes(userId)) return true;

  return new Promise((resolve) => {
    db.get("SELECT id FROM owner WHERE id = ?", [userId], (err, row) => {
      if (row) return resolve(true);

      db.get("SELECT id FROM whitelist WHERE id = ?", [userId], (err2, row2) => {
        resolve(!!row2);
      });
    });
  });
};

module.exports = {
  name: "channelCreate",

  async execute(channel) {
    if (!channel.guild) return;

    // Vérifie si l'antichannel est activé
    db.get(
      "SELECT antichannel FROM antiraid WHERE guild = ?",
      [channel.guild.id],
      async (err, row) => {
        if (err || !row?.antichannel) return;

        try {
          // Récupère les logs d'audit
          const fetchedLogs = await channel.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.ChannelCreate
          });

          const creationLog = fetchedLogs.entries.first();
          if (!creationLog) return;

          const executor = creationLog.executor;

          // Bypass owner / whitelist
          if (await bypass(executor.id)) return;

          // Supprime le salon créé
          await channel.delete("AntiChannel");

          // Embed log
          const embed = new EmbedBuilder()
            .setColor(config.color)
            .setDescription(
              `<@${executor.id}> a créé le salon <#${channel.id}> (supprimé automatiquement)`
            )
            .setTimestamp();

          // Logs
          sendLog(channel.guild, embed, "channellog");
          sendLog(channel.guild, embed, "raidlog");
        } catch (error) {
          console.error("Erreur AntiChannel :", error);
        }
      }
    );
  }
};
