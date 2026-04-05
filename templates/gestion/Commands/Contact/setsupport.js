const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  EmbedBuilder,
  ComponentType
} = require("discord.js");
const fs = require("fs");

exports.help = {
  name: "setsupport",
  aliases: [],
  category: "Contact",
  description: "Configurer le système de support"
};

exports.run = async (bot, message, args) => {

  // Charger ou créer support.json
  let support = {};
  if (fs.existsSync("./support.json")) {
    support = JSON.parse(fs.readFileSync("./support.json", "utf8"));
  } else {
    support = {
      title: "",
      description: "",
      footer: "",
      color: "",
      image: "",
      options: []
    };
  }

  // Embed de prévisualisation
  let embed = new EmbedBuilder()
    .setTitle(support.title || "Titre…")
    .setDescription(support.description || "Description…")
    .setColor(support.color || "#2F3136")
    .setFooter({ text: support.footer || "Footer…" });

  if (support.image) embed.setImage(support.image);

  // Menu
  const menu = new StringSelectMenuBuilder()
    .setCustomId("supportbuilder")
    .setPlaceholder("Configurer le support")
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel("Modifier le Titre").setValue("title"),
      new StringSelectMenuOptionBuilder().setLabel("Modifier la Description").setValue("description"),
      new StringSelectMenuOptionBuilder().setLabel("Modifier le Footer").setValue("footer"),
      new StringSelectMenuOptionBuilder().setLabel("Modifier la Couleur").setValue("color"),
      new StringSelectMenuOptionBuilder().setLabel("Modifier l'Image").setValue("image"),
      new StringSelectMenuOptionBuilder().setLabel("Ajouter une Option").setValue("addoption"),
      new StringSelectMenuOptionBuilder().setLabel("Supprimer une Option").setValue("deloption"),
      new StringSelectMenuOptionBuilder().setLabel("Sauvegarder & Envoyer").setValue("save")
    );

  const row = new ActionRowBuilder().addComponents(menu);

  const msg = await message.channel.send({
    content: "🎛️ **Support Builder** — configure ton système de support",
    embeds: [embed],
    components: [row]
  });

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: i => i.user.id === message.author.id
  });

  collector.on("collect", async interaction => {
    await interaction.deferUpdate();
    const value = interaction.values[0];

    const ask = async question => {
      const q = await message.channel.send(question);
      const collected = await message.channel.awaitMessages({
        filter: m => m.author.id === message.author.id,
        max: 1,
        time: 60000
      });
      q.delete();
      const content = collected.first().content;
      collected.first().delete();
      return content;
    };

    if (value === "title") {
      const t = await ask("📝 Nouveau **titre** :");
      support.title = t;
      embed.setTitle(t);
    }

    if (value === "description") {
      const d = await ask("📝 Nouvelle **description** :");
      support.description = d;
      embed.setDescription(d);
    }

    if (value === "footer") {
      const f = await ask("📝 Nouveau **footer** :");
      support.footer = f;
      embed.setFooter({ text: f });
    }

    if (value === "color") {
      const c = await ask("🎨 Nouvelle **couleur** (ex: #6495ED) :");
      support.color = c;
      embed.setColor(c);
    }

    if (value === "image") {
      const img = await ask("🖼️ Nouvelle **image** (URL) :");
      support.image = img;
      embed.setImage(img);
    }

    if (value === "addoption") {
      const opt = await ask("➕ Texte de l'option à ajouter :");
      support.options.push(opt);
    }

    if (value === "deloption") {
      const opt = await ask("❌ Numéro de l'option à supprimer :");
      const index = Number(opt) - 1;
      if (support.options[index]) support.options.splice(index, 1);
    }

    if (value === "save") {
      fs.writeFileSync("./support.json", JSON.stringify(support, null, 2));

      const channelId = await ask("📨 Dans quel salon dois-je envoyer le support ? (mention ou ID)");
      const channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(channelId);

      if (!channel) {
        return message.channel.send("❌ Salon introuvable.");
      }

      channel.send({ embeds: [embed] });

      return message.channel.send("✅ Support sauvegardé **et envoyé** !");
    }

    msg.edit({ embeds: [embed] });
  });
};
