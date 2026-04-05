const db = require("../Events/loadDatabase");

module.exports = {
  name: "blacklistSync",

  async execute(guild) {
    try {
      db.all("SELECT id FROM blacklist WHERE guild = ?", [guild.id], (err, rows) => {
        if (err) return console.error("Erreur blacklistSync :", err);

        const blacklist = rows.map(r => r.id);
        guild.blacklistCache = new Set(blacklist);
      });
    } catch (err) {
      console.error("Erreur blacklistSync :", err);
    }
  }
};
