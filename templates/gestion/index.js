// ===============================
//  BOT ENFANT — DISCORD.JS v15
// ===============================

const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ===============================
//  LECTURE DU TOKEN
// ===============================
try {
    const tokenPath = path.join(__dirname, "token.txt");
    process.env.TOKEN = fs.readFileSync(tokenPath, "utf8").trim();

    if (!process.env.TOKEN || process.env.TOKEN.length < 50) {
        console.error("[ERROR] Token invalide ou vide dans token.txt");
        process.exit(1);
    }
} catch (err) {
    console.error("[ERROR] Impossible de lire token.txt :", err);
    process.exit(1);
}

// ===============================
//  INITIALISATION DU CLIENT
// ===============================
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.ThreadMember,
        Partials.GuildScheduledEvent
    ]
});

// ===============================
//  COLLECTIONS
// ===============================
bot.commands = new Collection();
bot.aliases = new Collection();

// ===============================
//  CHARGEMENT DES COMMANDES
// ===============================
const commandsPath = path.join(__dirname, "Commands");

if (fs.existsSync(commandsPath)) {
    for (const folder of fs.readdirSync(commandsPath)) {
        const folderPath = path.join(commandsPath, folder);

        for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith(".js"))) {
            const cmd = require(path.join(folderPath, file));

            bot.commands.set(cmd.name, cmd);
            if (cmd.aliases) {
                cmd.aliases.forEach(alias => bot.aliases.set(alias, cmd.name));
            }
        }
    }
}

// ===============================
//  CHARGEMENT DES EVENTS
// ===============================
const eventsPath = path.join(__dirname, "Events");

for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"))) {
    const event = require(path.join(eventsPath, file));

    if (event.once) {
        bot.once(event.name, (...args) => event.execute(...args, bot));
    } else {
        bot.on(event.name, (...args) => event.execute(...args, bot));
    }
}

// ===============================
//  CONNEXION
// ===============================
bot.login(process.env.TOKEN).catch(err => {
    console.error("[ERROR] Impossible de se connecter :", err);
    process.exit(1);
});
