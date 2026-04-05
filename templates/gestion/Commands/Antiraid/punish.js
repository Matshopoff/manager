const db = require('../../Events/loadDatabase');
const config = require('../../config.json');
const { EmbedBuilder } = require('discord.js');

exports.help = {
  name: 'punish',
  description: "Permet de gérer les sanctions pour l'antiraid",
  help: 'punish <module> <ban/kick/derank/timeout>',
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

  // Liste des modules et sanctions possibles
  const modules = [
    'antispam', 'antichannel', 'antirole', 'antiupdate', 'antivanity',
    'antiwebhook', 'antiban', 'antieveryone', 'antibot', 'antilink'
  ];

  const sanc = ['ban', 'kick', 'derank', 'timeout'];

  const [module, sanction] = args;

  // Si aucune sanction n'est fournie → afficher la liste
  if (!module && !sanction) {
    const rows = db.prepare(
      'SELECT module, punition FROM punish WHERE guild = ?'
    ).all(message.guild.id);

    let description = rows.length
      ? rows.map(r => `**${r.module} :** \`${r.punition || ''}\``).join('\n')
      : 'Aucune sanction définie.';

    const embed = new EmbedBuilder()
      .setDescription(description)
      .setColor(config.color)
      .setFooter({
        text: message.guild.name,
        iconURL: message.guild.iconURL({ dynamic: true })
      });

    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }

  // Vérification des arguments
  if (!module || !sanction || !modules.includes(module.toLowerCase()) || !sanc.includes(sanction.toLowerCase())) {
    return message.reply({
      content: `\`${exports.help.help}\`\nModules: ${modules.join(', ')}\nSanctions: ${sanc.join(', ')}`,
      allowedMentions: { repliedUser: false }
    });
  }

  // Mise à jour de la sanction
  db.prepare(`
    INSERT INTO punish (guild, module, punition)
    VALUES (?, ?, ?)
    ON CONFLICT(guild, module) DO UPDATE SET punition = ?
  `).run(
    message.guild.id,
    module.toLowerCase(),
    sanction.toLowerCase(),
    sanction.toLowerCase()
  );

  // Récupération de toutes les sanctions après mise à jour
  const rows = db.prepare(
    'SELECT module, punition FROM punish WHERE guild = ?'
  ).all(message.guild.id);

  let description = rows.length
    ? rows.map(r => `**${r.module} :** \`${r.punition || ''}\``).join('\n')
    : 'Aucune sanction définie.';

  const embed = new EmbedBuilder()
    .setDescription(description)
    .setColor(config.color)
    .setFooter({
      text: message.guild.name,
      iconURL: message.guild.iconURL({ dynamic: true })
    });

  message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
};
