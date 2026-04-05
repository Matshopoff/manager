const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const db = require("../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("createschool")
        .setDescription("Créer un bot school")
        .addStringOption(o => o.setName("token").setDescription("Token du bot").setRequired(true))
        .addStringOption(o => o.setName("clé").setDescription("Clé d'activation").setRequired(true)),

    async run(client, interaction) {
        const token = interaction.options.getString("token");

        const botId = Date.now().toString();
        const folder = `./storage/bots/school/${botId}`;

        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(`${folder}/token.txt`, token);

        fs.writeFileSync(`${folder}/bot.js`, `
const { Client } = require("discord.js");
const fs = require("fs");

const token = fs.readFileSync("./token.txt", "utf8");

const client = new Client({ intents: [] });

client.once("ready", () => console.log("Bot school ${botId} lancé"));
client.login(token);
        `);

        db.addBot(interaction.user.id, botId, "school", token);

        interaction.reply(`Bot school créé avec l'ID **${botId}**`);
    }
};
