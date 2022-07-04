class TodoRepository {
    constructor(database) {
        this.database = database;
        this.createTable();
    }

    createTable() {
        this.database.run(
            `CREATE TABLE todo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contents text,
                done tinyint DEFAULT 0
            )`,
            (err) => {
                if (err) {
                    // Table already created
                } else {
                    console.log("Table 'todo' created");
                    // Table just created, creating some rows
                    const insert = 'INSERT INTO todo (contents, done) VALUES (?,?)';
                    this.database.run(insert, ['Acheter des bières', 0]);
                    this.database.run(insert, ['Tondre le jardin', 0]);
                    this.database.run(insert, ['Nettoyer le barbecue', 1]);
                }
            },
        );
    }

    list() {
        return new Promise((resolve, reject) => {
            this.database.all('SELECT * FROM todo', [], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    resolve(
                        rows.map((row) => this.decorator(row)),
                    );
                }
            });
        });
    }

    get(id) {
        return new Promise((resolve, reject) => {
            this.database.get('SELECT * FROM todo WHERE id = ?', [id], (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    resolve(
                        this.decorator(row),
                    );
                }
            });
        });
    }

    decorator(todo) {
        return {
            ...todo,
            done: todo.done === 1,
        };
    }
}

module.exports = TodoRepository;
