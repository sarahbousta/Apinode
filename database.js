/* eslint-disable no-console */
const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = 'db.sqlite';

const db = new sqlite3.Database(DBSOURCE, (errConnect) => {
    if (errConnect) {
        // Cannot open database
        console.error(errConnect.message);
        throw errConnect;
    } else {
        console.log('Connected to the SQLite database.');
        db.run(
            `CREATE TABLE todo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contents text,
                done tinyint DEFAULT 0
            )`,
            (errQuery) => {
                if (errQuery) {
                // Table already created
                } else {
                // Table just created, creating some rows
                    const insert = 'INSERT INTO todo (contents, done) VALUES (?,?)';
                    db.run(insert, ['Acheter des bières', 0]);
                    db.run(insert, ['Tondre le jardin', 0]);
                    db.run(insert, ['Nettoyer le barbecue', 1]);
                }
            },
        );
    }
});

module.exports = db;
