const { EmbedBuilder } = require("discord.js");
const config = require("../config.json");
const sendLog = require("./sendlog");

module.exports = {
  name: "voiceStateUpdate",

  async execute(oldState, newState) {
    try {
      const guild = newState.guild;

      // Connexion à un salon vocal
      if (!oldState.channelId && newState.channelId) {
        const embed = new EmbedBuilder()
          .setColor(config.color)
          .setDescription(
            `🎧 <@${newState.id}> a rejoint le salon vocal **${newState.channel.name}**`
          )
          .setTimestamp();

        sendLog(guild, embed, "voicelog");
      }

      // Déconnexion d’un salon vocal
      else if (oldState.channelId && !newState.channelId) {
        const embed = new EmbedBuilder()
          .setColor(config.color)
          .setDescription(
            `🔇 <@${newState.id}> a quitté le salon vocal **${oldState.channel.name}**`
          )
          .setTimestamp();

        sendLog(guild, embed, "voicelog");
      }

      // Changement de salon vocal
      else if (oldState.channelId !== newState.channelId) {
        const embed = new EmbedBuilder()
          .setColor(config.color)
          .setDescription(
            `🔄 <@${newState.id}> est passé de **${oldState.channel.name}** à **${newState.channel.name}**`
          )
          .setTimestamp();

        sendLog(guild, embed, "voicelog");
      }
    } catch (err) {
      console.error("Erreur voiceStateUpdate :", err);
    }
  }
};
