const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");
const sendLog = require("./sendlog");

module.exports = {
  name: "guildMemberUpdate",

  async execute(oldMember, newMember) {
    try {
      // Changement de pseudo
      if (oldMember.nickname !== newMember.nickname) {
        const embed = new EmbedBuilder()
          .setColor(config.color)
          .setDescription(
            `✏️ <@${newMember.id}> a changé son pseudo :\n` +
            `**Avant :** ${oldMember.nickname || "Aucun"}\n` +
            `**Après :** ${newMember.nickname || "Aucun"}`
          )
          .setTimestamp();

        sendLog(newMember.guild, embed, "memberlog");
      }

      // Changement de rôles
      const oldRoles = oldMember.roles.cache;
      const newRoles = newMember.roles.cache;

      const added = newRoles.filter(r => !oldRoles.has(r.id));
      const removed = oldRoles.filter(r => !newRoles.has(r.id));

      if (added.size > 0 || removed.size > 0) {
        const fields = [];

        if (added.size > 0) {
          fields.push({
            name: "➕ Ajoutés",
            value: added.map(r => `<@&${r.id}>`).join(", ")
          });
        }

        if (removed.size > 0) {
          fields.push({
            name: "➖ Retirés",
            value: removed.map(r => `<@&${r.id}>`).join(", ")
          });
        }

        const embed = new EmbedBuilder()
          .setColor(config.color)
          .setDescription(`🔧 Mise à jour des rôles pour <@${newMember.id}>`)
          .addFields(fields)
          .setTimestamp();

        sendLog(newMember.guild, embed, "memberlog");
      }
    } catch (err) {
      console.error("Erreur guildMemberUpdate :", err);
    }
  }
};
