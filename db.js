
// db.js
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
        return;
    }

    console.log('Banco de dados aberto com sucesso.');
});

db.serialize(() => {
    db.run('CREATE TABLE usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)');
});

module.exports = db;