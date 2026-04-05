const fs = require("fs");
const path = require("path");

module.exports = (bot) => {
    const eventsPath = path.join(__dirname, "../Events");
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));

        if (event.once) {
            bot.once(event.name, (...args) => event.execute(...args, bot));
        } else {
            bot.on(event.name, (...args) => event.execute(...args, bot));
        }
    }
};
