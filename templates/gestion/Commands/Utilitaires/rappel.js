const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const RAPPEL_FILE = path.join(process.cwd(), 'database', 'rappels.json');

/* =========================
   INIT FILE
========================= */
if (!fs.existsSync(path.dirname(RAPPEL_FILE))) {
  fs.mkdirSync(path.dirname(RAPPEL_FILE), { recursive: true });
}

if (!fs.existsSync(RAPPEL_FILE)) {
  fs.writeFileSync(RAPPEL_FILE, JSON.stringify([], null, 2));
}

/* =========================
   UTILS
========================= */
function parseTime(time) {
  const match = time.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  const map = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000
  };

  return value * map[unit];
}

function loadRappels() {
  return JSON.parse(fs.readFileSync(RAPPEL_FILE, 'utf8'));
}

function saveRappels(data) {
  fs.writeFileSync(RAPPEL_FILE, JSON.stringify(data, null, 2));
}

/* =========================
   COMMAND INFO
========================= */
exports.help = {
  name: 'rappel',
  helpname: 'rappel <temps> <message>',
  description: 'Créer un rappel en DM'
};

/* =========================
   COMMAND RUN
========================= */
exports.run = async (bot, message, args) => {

  const timeArg = args[0];
  const text = args.slice(1).join(' ');

  if (!timeArg || !text) {
    return message.reply(
      '❌ Utilisation : `rappel <temps> <message>`\nEx: `rappel 2h Lancer la backup`'
    );
  }

  const duration = parseTime(timeArg);
  if (!duration) {
    return message.reply('❌ Temps invalide (`10m`, `2h`, `1d`...)');
  }

  const triggerAt = Date.now() + duration;

  const rappels = loadRappels();
  rappels.push({
    userId: message.author.id,
    text,
    triggerAt
  });

  saveRappels(rappels);

  const embed = new EmbedBuilder()
    .setColor('Green')
    .setTitle('⏰ Rappel enregistré')
    .setDescription(
      `📅 **À :** <t:${Math.floor(triggerAt / 1000)}:F>\n📝 **Message :** ${text}`
    )
    .setFooter({text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true })
});

  message.reply({ embeds: [embed] });
};

/* =========================
   CHECK LOOP (AUTO)
========================= */
module.exports.checkRappels = async (client) => {
  setInterval(async () => {
    let rappels = loadRappels();
    const now = Date.now();

    const remaining = [];

    for (const r of rappels) {
      if (now >= r.triggerAt) {
        try {
          const user = await client.users.fetch(r.userId);
          const embed = new EmbedBuilder()
            .setColor('Orange')
            .setTitle('⏰ Rappel')
            .setDescription(`📝 **${r.text}**`)
            .setFooter({text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true })
});

          await user.send({ embeds: [embed] });
        } catch {}

      } else {
        remaining.push(r);
      }
    }

    saveRappels(remaining);
  }, 10000); // check toutes les 10 secondes
};