const fs = require('fs');

module.exports = (bot) => {
  let totalLoaded = 0;
  let totalFailed = 0;

  const loadCommand = (path, file, folder = null) => {
    try {
      const props = require(path);

      if (!props.help || !props.help.name) {
        console.log(`⚠️ Commande invalide : ${file} ${folder ? `(${folder})` : ''}`);
        totalFailed++;
        return;
      }

      bot.commands.set(props.help.name, props);

      if (props.help.aliases && Array.isArray(props.help.aliases)) {
        props.help.aliases.forEach((alias) => {
          bot.commands.set(alias, props);
        });
      }

      totalLoaded++;
    } catch (err) {
      console.log(`❌ Erreur lors du chargement de ${file} ${folder ? `(${folder})` : ''}`);
      console.log(err.message);
      totalFailed++;
    }
  };

  // Fichiers à la racine
  const rootFiles = fs.readdirSync('./Commands/').filter(f => f.endsWith('.js'));
  for (const file of rootFiles) {
    loadCommand(`../Commands/${file}`, file);
  }

  // Sous-dossiers
  const folders = fs.readdirSync('./Commands/').filter(f => !f.endsWith('.js'));
  for (const folder of folders) {
    const files = fs.readdirSync(`./Commands/${folder}/`).filter(f => f.endsWith('.js'));

    for (const file of files) {
      loadCommand(`../Commands/${folder}/${file}`, file, folder);
    }
  }

  // Résumé propre
  console.log(`✔ ${totalLoaded} commandes chargées`);
  if (totalFailed > 0) {
    console.log(`❌ ${totalFailed} commandes en erreur`);
  }
};
