const db = require("../Events/loadDatabase");
const {
  ChannelType,
  PermissionFlagsBits,
  AuditLogEvent,
  EmbedBuilder
} = require("discord.js");

const sendLog = require("./sendlog");
const config = require("../config.json");

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
  name: "channelDelete",

  async execute(channel) {
    if (!channel || !channel.guild) return;

    db.get(
      "SELECT antichannel FROM antiraid WHERE guild = ?",
      [channel.guild.id],
      async (err, row) => {
        if (err || !row?.antichannel) return;

        try {
          // Récupération des logs d'audit
          const fetchedLogs = await channel.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.ChannelDelete
          });

          const deleteLog = fetchedLogs.entries.first();
          if (!deleteLog) return;

          const executor = deleteLog.executor;

          // Bypass owner / whitelist
          if (await bypass(executor.id)) return;

          // Récupération des logs de salons
          db.get(
            "SELECT channels FROM logs WHERE guild = ?",
            [channel.guild.id],
            async (err, row) => {
              if (err || !row?.channels) return;

              let channels = {};
              try {
                channels = JSON.parse(row.channels);
              } catch (e) {
                console.error("Erreur JSON channels logs:", e);
                return;
              }

              // Trouver le nom du salon supprimé
              const entry = Object.entries(channels).find(
                ([name, id]) => id === channel.id
              );
              if (!entry) return;

              // Trouver la catégorie logs
              const logsCategory = channel.guild.channels.cache.find(
                (c) =>
                  c.type === ChannelType.GuildCategory &&
                  c.name.toLowerCase() === "logs"
              );
              if (!logsCategory) return;

              // Recréation du salon supprimé
              const newChannel = await channel.guild.channels.create({
                name: entry[0],
                type: ChannelType.GuildText,
                parent: logsCategory.id,
                permissionOverwrites: [
                  {
                    id: channel.guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                  },
                  {
                    id: channel.guild.ownerId,
                    allow: [PermissionFlagsBits.ViewChannel]
                  }
                ]
              });

              // Repositionnement
              try {
                await newChannel.setPosition(channel.rawPosition);
              } catch (e) {}

              // Mise à jour en base
              channels[entry[0]] = newChannel.id;
              db.run(
                `UPDATE logs SET channels = ? WHERE guild = ?`,
                [JSON.stringify(channels), channel.guild.id],
                (err2) => {
                  if (err2)
                    console.error("Erreur mise à jour logs channels:", err2);
                }
              );

              // Embed
              const embed = new EmbedBuilder()
                .setColor(config.color)
                .setDescription(
                  `<@${executor.id}> a supprimé le salon \`${channel.name}\` (${channel.id}). Il a été recréé automatiquement : <#${newChannel.id}>.`
                )
                .setTimestamp();

              // Logs
              sendLog(channel.guild, embed, "channellog");
              sendLog(channel.guild, embed, "raidlog");
            }
          );
        } catch (error) {
          console.error("Erreur dans channelDelete :", error);
        }
      }
    );
  }
};
