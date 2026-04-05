const { EmbedBuilder } = require('discord.js');
const db = require('../../Events/loadDatabase');
const config = require('../../config.json');

exports.help = {
  name: 'protect',
  helpname: 'protect',
  aliases: ['secur'],
  description: "Affiche l'état de l'antiraid",
  help: 'protect',
};

exports.run = async (bot, message, args) => {

  // Vérification des permissions
  const checkPerm = async (message, commandName) => {

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

  // Récupération des protections
  const row = db.prepare(
    'SELECT * FROM antiraid WHERE guild = ?'
  ).get(message.guild.id);

  if (!row) {
    return message.reply("Aucune configuration antiraid trouvée pour ce serveur.");
  }

  // Formatage antispam
  let antispamStatus = '❌';
  if (row.antispam) {
    const sousSec = Math.round(row.sous / 1000);
    const timeoutSec = Math.round(row.timeout / 1000);
    antispamStatus = `✅ (${row.nombremessage} msgs / ${sousSec}s ・ ${timeoutSec}s timeout)`;
  }

  const protections = {
    Antispam: antispamStatus,
    Antilink: row.antilink ? `✅ (${row.type})` : '❌',
    Antichannel: row.antichannel ? '✅' : '❌',
    Antirole: row.antirole ? '✅' : '❌',
    Antiupdate: row.antiupdate ? '✅' : '❌',
    Antivanity: row.antivanity ? '✅' : '❌',
    Antiwebhook: row.antiwebhook ? '✅' : '❌',
    Antiban: row.antiban ? '✅' : '❌',
    Antieveryone: row.antieveryone ? '✅' : '❌',
    Antibot: row.antibot ? '✅' : '❌'
  };

  const description = Object.entries(protections)
    .map(([name, status]) => `**${name} :** \`${status}\``)
    .join('\n');

  const embed = new EmbedBuilder()
    .setDescription(description)
    .setColor(config.color)
    .setFooter({
      text: message.guild.name,
      iconURL: message.guild.iconURL({ dynamic: true })
    });

  message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
};
