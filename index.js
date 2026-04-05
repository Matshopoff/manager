require('dotenv').config({ path: __dirname + '/parent.env' });
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

// =========================
// INITIALISATION DU CLIENT
// =========================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// =========================
// CHARGEMENT DES COMMANDES
// =========================
const commandFiles = fs.readdirSync(path.join(__dirname, "commands"))
    .filter(f => f.endsWith(".js"));

const commandsArray = [];

for (const file of commandFiles) {
    const cmd = require(`./commands/${file}`);
    client.commands.set(cmd.data.name, cmd);
    commandsArray.push(cmd.data.toJSON());
}

console.log(`✔ ${client.commands.size} commandes chargées`);

// =========================
// CHARGEMENT DES EVENTS
// =========================
const eventFiles = fs.readdirSync(path.join(__dirname, "events"))
    .filter(f => f.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

console.log(`✔ ${eventFiles.length} events chargés`);

// =========================
// HANDLER DES INTERACTIONS
// =========================
client.on("interactionCreate", async interaction => {

    if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (!cmd) return;

        try {
            await cmd.execute(interaction, client);
        } catch (err) {
            console.error(err);
            interaction.reply({ content: "❌ Une erreur est survenue.", ephemeral: true });
        }
        return;
    }

    if (interaction.isStringSelectMenu()) {
        const menuId = interaction.customId;

        const menuFile = path.join(__dirname, "interactions", `${menuId}.js`);
        if (!fs.existsSync(menuFile)) {
            return interaction.reply({ content: "❌ Menu introuvable.", ephemeral: true });
        }

        const menu = require(menuFile);

        try {
            await menu.execute(interaction, client);
        } catch (err) {
            console.error(err);
            interaction.reply({ content: "❌ Une erreur est survenue.", ephemeral: true });
        }
    }
});

// =========================
// SYNCHRONISATION COMMANDES
// =========================
client.once("ready", async () => {
    console.log(`[PARENT] Connecté en tant que ${client.user.tag}`);

    const rest = new REST({ version: "10" }).setToken(process.env.PARENT_TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(process.env.PARENT_CLIENT_ID),
            { body: commandsArray }
        );
        console.log("✔ Commandes synchronisées avec Discord !");
    } catch (err) {
        console.error("❌ Erreur lors de la synchro :", err);
    }

    console.log("[PARENT] Démarrage du manager de bots enfants...");
    require("./manager/childManager")(client);

    console.log("⏳ Surveillance des licences activée...");
    require("./utils/licenseWatcher")(client);
});

// =========================
// CONNEXION DU BOT
// =========================
client.login(process.env.PARENT_TOKEN);
