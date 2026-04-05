module.exports = async (guild, embed, type) => {
  try {
    const db = require("../Events/loadDatabase");

    db.get(
      "SELECT * FROM logs WHERE guild = ?",
      [guild.id],
      async (err, row) => {
        if (err || !row) return;

        const channelId = row[type];
        if (!channelId) return;

        const channel = guild.channels.cache.get(channelId);
        if (!channel) return;

        await channel.send({ embeds: [embed] });
      }
    );
  } catch (err) {
    console.error("Erreur sendlog :", err);
  }
};
