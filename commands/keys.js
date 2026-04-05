const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("keys")
        .setDescription("Gestion des clés de licence")
        .addSubcommand(sub =>
            sub.setName("add")
                .setDescription("Créer une nouvelle clé")
                .addIntegerOption(opt =>
                    opt.setName("jours")
                        .setDescription("Durée en jours")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("list")
                .setDescription("Afficher toutes les clés")
        )
        .addSubcommand(sub =>
            sub.setName("remove")
                .setDescription("Supprimer une clé")
                .addStringOption(opt =>
                    opt.setName("clé")
                        .setDescription("La clé à supprimer")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ Tu n'as pas la permission.", ephemeral: true });
        }

        const sub = interaction.options.getSubcommand();
        const keysPath = path.join(__dirname, "../data/keys.json");

        if (!fs.existsSync(keysPath)) {
            fs.writeFileSync(keysPath, "{}");
        }

        let keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));

        // ============================
        // /keys add
        // ============================
        if (sub === "add") {
            const days = interaction.options.getInteger("jours");

            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+?";
            let key = "";
            for (let i = 0; i < 8; i++) key += chars[Math.floor(Math.random() * chars.length)];

            keys[key] = {
                days: days,
                used: false,
                guild: null,
                activatedAt: null
            };

            fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));

            return interaction.reply(`🔑 Nouvelle clé générée : \`${key}\`\n⏳ Durée : **${days} jours**`);
        }

        // ============================
        // /keys list
        // ============================
        if (sub === "list") {
            let msg = "📜 **Liste des clés :**\n\n";

            for (const key in keys) {
                const data = keys[key];
                msg += `🔑 \`${key}\` — ${data.used ? "❌ Utilisée" : "✅ Libre"} — ${data.days} jours\n`;
            }

            return interaction.reply(msg || "Aucune clé trouvée.");
        }

        // ============================
        // /keys remove
        // ============================
        if (sub === "remove") {
            const keyToRemove = interaction.options.getString("clé");

            if (!keys[keyToRemove]) {
                return interaction.reply("❌ Cette clé n'existe pas.");
            }

            delete keys[keyToRemove];
            fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));

            return interaction.reply(`🗑️ Clé \`${keyToRemove}\` supprimée.`);
        }
    }
};
