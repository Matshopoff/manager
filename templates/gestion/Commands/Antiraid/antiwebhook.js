const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const db = require('../../Events/loadDatabase');

exports.help = {
  name: 'antiwebhook',
  description: "Active/désactive l'antiwebhook",
  help: 'antiwebhook on/off',
};

exports.run = async (bot, message, args) => {

  // Vérification des permissions
  const checkPerm = async (message, commandName) => {

    // Owner config.json
    if (config.owners.includes(message.author.id)) return true;

    // Public ON ?
    const publicRow = db.prepare(
      'SELECT statut FROM public WHERE guild = ? AND statut = ?'
    ).get(message.guild.id, 'on');

    if (publicRow) {
      const publicCmd = db.prepare(
        'SELECT command FROM cmdperm WHERE perm = ? AND command = ? AND guild = ?'
      ).get('public', commandName, message.guild.id);

      if (publicCmd) return true;
    }

    // Whitelist
    const wl = db.prepare(
      'SELECT id FROM whitelist WHERE id = ?'
    ).get(message.author.id);

    if (wl) return true;

    // Owner DB
    const ownerDb = db.prepare(
      'SELECT id FROM owner WHERE id = ?'
    ).get(message.author.id);

    if (ownerDb) return true;

    // Permissions via rôles
    const roles = message.member.roles.cache.map(r => r.id);
    if (roles.length === 0) return false;

    const placeholders = roles.map(() => '?').join(',');
    const permRows = db.prepare(
      `SELECT perm FROM permissions WHERE id IN (${placeholders}) AND guild = ?`
    ).all(...roles, message.guild.id);

    const perms = permRows.map(r => r.perm);
    if (perms.length === 0) return false;

    const permPlaceholders = perms.map(() => '?').join(',');
    const cmdRows = db.prepare(
      `SELECT command FROM cmdperm WHERE perm IN (${permPlaceholders}) AND guild = ?`
    ).all(...perms, message.guild.id);

    const allowedCmds = cmdRows.map(r => r.command);

    return allowedCmds.includes(commandName);
  };

  // Permission refusée
  if (!(await checkPerm(message, exports.help.name))) {
    const noacces = new EmbedBuilder()
      .setDescription("Vous n'avez pas la permission d'utiliser cette commande")
      .setColor(config.color)
      .setFooter({
        text: message.guild.name,
        iconURL: message.guild.iconURL({ dynamic: true })
      });

    return message.reply({
      embeds: [noacces],
      allowedMentions: { repliedUser: true }
    }).then(m => setTimeout(() => m.delete().catch(() => {}), 2000));
  }

  // Activation / désactivation
  const guildId = message.guild.id;
  const status = args[0]?.toLowerCase() === 'on' ? 1 : 0;

  db.prepare(`
    INSERT INTO antiraid (guild, antiwebhook)
    VALUES (?, ?)
    ON CONFLICT(guild) DO UPDATE SET antiwebhook = ?
  `).run(guildId, status, status);

  const response = status
    ? "L'antiwebhook a bien été activé."
    : "L'antiwebhook a bien été désactivé.";

  message.reply(response);
};
