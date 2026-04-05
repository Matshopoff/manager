const db = require("../Events/loadDatabase");

module.exports = {
  name: "memberCountUpdate",

  async execute(guild) {
    try {
      db.get(
        "SELECT membercount FROM settings WHERE guild = ?",
        [guild.id],
        async (err, row) => {
          if (err || !row?.membercount) return;

          const channel = guild.channels.cache.get(row.membercount);
          if (!channel) return;

          await channel.setName(`👥 Membres : ${guild.memberCount}`);
        }
      );
    } catch (err) {
      console.error("Erreur memberCountUpdate :", err);
    }
  }
};
