const express = require('express');

const app = express();
const db = require('./database');

const HTTP_PORT = 8000;

app.listen(HTTP_PORT, () => {
    console.log(`Server running on port ${HTTP_PORT}`);
});

app.get('/', (req, res, next) => {
    res.json({ message: 'Hello World' });
});

const TodoRepository = require('./repository/TodoRepository');

app.get('/api/todo', (req, res, next) => {
    const repo = new TodoRepository(db);
    repo.list()
        .then((result) => {
            res.json({
                success: true,
                data: result,
            });
        })
        .catch((err) => {
            res.status(400).json({ error: err.message });
        });
});
app.get('/api/todo/:id', (req, res, next) => {
    const repo = new TodoRepository(db);
    repo.get(req.params.id)
        .then((result) => {
            res.json({
                success: true,
                data: result,
            });
        })
        .catch((err) => {
            res.status(400).json({ error: err.message });
        });
});

// Fallback route
app.use((req, res) => {
    res.status(404);
});
