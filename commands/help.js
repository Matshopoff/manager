const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Affiche l'aide"),

    async run(client, interaction) {
        const embed = new EmbedBuilder()
            .setTitle("📘 Liste des commandes")
            .setColor("#5865F2")
            .setDescription("Voici toutes les commandes disponibles :")
            .addFields(
                { name: "/creategestion", value: "Créer un bot gestion" },
                { name: "/createschool", value: "Créer un bot school" },
                { name: "/createinter", value: "Créer un bot inter-serveur" },
                { name: "/mybots", value: "Voir vos bots" },
                { name: "/start", value: "Démarrer un bot" },
                { name: "/stop", value: "Arrêter un bot" },
                { name: "/restart", value: "Redémarrer un bot" },
                { name: "/changetoken", value: "Changer le token d'un bot" },
                { name: "/claim", value: "Ajouter 1 mois via une clé" },
                { name: "/recup", value: "Générer un code de récupération" },
                { name: "/buybot", value: "Acheter un bot" }
            );

        interaction.reply({ embeds: [embed] });
    }
};
