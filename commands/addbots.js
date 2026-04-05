const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addbot")
        .setDescription("Créer un bot enfant")
        .addStringOption(opt =>
            opt.setName("botid")
                .setDescription("ID du bot enfant")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("type")
                .setDescription("gestion ou inter")
                .addChoices(
                    { name: "gestion", value: "gestion" },
                    { name: "inter", value: "inter" }
                )
                .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName("temps")
                .setDescription("Durée en jours")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("token")
                .setDescription("Token du bot enfant")
                .setRequired(true)
        ),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "❌ Tu n'as pas la permission.", flags: 64 });
        }

        const botId = interaction.options.getString("botid");
        const type = interaction.options.getString("type");
        const days = interaction.options.getInteger("temps");
        const token = interaction.options.getString("token");

        const botsPath = path.join(__dirname, "../data/bots.json");
        const templatePath = path.join(__dirname, `../templates/${type}`);
        const botFolder = path.join(__dirname, `../storage/bots/${type}/${botId}`);

        if (!fs.existsSync(templatePath)) {
            return interaction.reply({
                content: `❌ Le template **${type}** est introuvable.`,
                flags: 64
            });
        }

        let bots = {};
        if (fs.existsSync(botsPath)) {
            bots = JSON.parse(fs.readFileSync(botsPath, "utf8"));
        }

        if (bots[botId]) {
            return interaction.reply({ content: "❌ Ce bot existe déjà.", flags: 64 });
        }

        // Génération licence
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let license = "";
        for (let i = 0; i < 8; i++) license += chars[Math.floor(Math.random() * chars.length)];

        // Copie du template
        await fse.copy(templatePath, botFolder);

        // 🔥 Correction automatique de TOUS les package.json (supprime "type": "module")
        const walk = (dir) => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const full = path.join(dir, file);
                const stat = fs.statSync(full);

                if (stat.isDirectory()) {
                    walk(full);
                } else if (file === "package.json") {
                    const pkg = JSON.parse(fs.readFileSync(full, "utf8"));
                    if (pkg.type === "module") {
                        delete pkg.type;
                        fs.writeFileSync(full, JSON.stringify(pkg, null, 2));
                    }
                }
            }
        };
        walk(botFolder);

        // -----------------------------
        // 🔵 PARTIE SPÉCIALE POUR INTER
        // -----------------------------
        if (type === "inter") {
            fs.writeFileSync(
                path.join(botFolder, ".env"),
                `DISCORD_TOKEN=${token}\nCLIENT_ID=${botId}`
            );
        }

        // Stockage du token
        fs.writeFileSync(path.join(botFolder, "token.txt"), token);

        // Enregistrement
        bots[botId] = {
            owner: interaction.user.id,
            type,
            expireAt: Date.now() + days * 24 * 60 * 60 * 1000,
            license,
            token,
            createdAt: Date.now()
        };

        fs.writeFileSync(botsPath, JSON.stringify(bots, null, 2));

        interaction.reply({
            content:
                `✅ Bot créé avec succès !\n` +
                `📌 **ID :** ${botId}\n` +
                `📁 **Type :** ${type}\n` +
                `⏳ **Expire dans :** ${days} jours\n` +
                `🔑 **Licence :** \`${license}\``
        });
    }
};
