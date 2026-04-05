const db = require('../../Events/loadDatabase');
const config = require('../../config.json');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ITEMS_PER_PAGE = 10;

exports.help = {
  name: 'whitelist',
  helpname: 'whitelist [mention/id]',
  aliases: ['wl'],
  description: 'Permet de gérer la whitelist',
  help: 'whitelist [mention/id]\nwhitelist',
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

  // SI AUCUN ARGUMENT → AFFICHAGE PAGINÉ
  if (args.length === 0) {

    const rows = db.prepare('SELECT id FROM whitelist').all();

    if (rows.length === 0) {
      return message.reply("La whitelist est vide.");
    }

    const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);
    let currentPage = 1;

    const generateEmbed = async (page) => {
      const embed = new EmbedBuilder()
        .setTitle('Whitelist')
        .setColor(config.color)
        .setFooter({
          text: `${message.guild.name} | ${rows.length} personnes - ${page}/${totalPages}`,
          iconURL: message.guild.iconURL({ dynamic: true })
        });

      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = Math.min(start + ITEMS_PER_PAGE, rows.length);

      for (let i = start; i < end; i++) {
        const user = await bot.users.fetch(rows[i].id).catch(() => null);
        embed.addFields({
          name: user ? user.tag : 'Utilisateur introuvable',
          value: rows[i].id,
          inline: false
        });
      }

      return embed;
    };

    const embed = await generateEmbed(currentPage);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('Précédent')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 1),

      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Suivant')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === totalPages)
    );

    const reply = await message.reply({ embeds: [embed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 60000
    });

    collector.on('collect', async interaction => {
      if (interaction.customId === 'prev') currentPage--;
      if (interaction.customId === 'next') currentPage++;

      const newEmbed = await generateEmbed(currentPage);

      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('Précédent')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 1),

        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Suivant')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === totalPages)
      );

      await interaction.update({ embeds: [newEmbed], components: [newRow] });
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });

    return;
  }

  // AJOUT D’UN UTILISATEUR
  const user = message.mentions.users.first() || await bot.users.fetch(args[0]).catch(() => null);
  if (!user) return message.reply("Utilisateur introuvable.");

  const result = db.prepare(`INSERT OR IGNORE INTO whitelist (id) VALUES (?)`).run(user.id);

  if (result.changes === 0) {
    return message.reply(`<@${user.id}> est déjà dans la whitelist.`);
  }

  message.reply(`<@${user.id}> a été ajouté à la whitelist.`);
};
