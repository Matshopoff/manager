const fs = require("fs");
const path = require("path");

module.exports = (client) => {
    const commandFiles = fs.readdirSync(path.join(__dirname, "../commands"))
        .filter(f => f.endsWith(".js"));

    for (const file of commandFiles) {
        const cmd = require(`../commands/${file}`);
        client.commands.set(cmd.data.name, cmd);
    }

    console.log(`✔ ${client.commands.size} commandes chargées`);
};
