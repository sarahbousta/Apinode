/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const HTTP_PORT = 8000;
const API_KEY = '8f94826adab8ffebbeadb4f9e161b2dc';

const db = new sqlite3.Database('db.sqlite'); 

// Middleware pour vérifier l'API Key
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if ( apiKey !== API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    next();
  }
};



// Middleware pour la gestion des ETags
const addEtag = (req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');
  next();
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Insérer des données d'exemple au démarrage du serveur
db.serialize(() => {
  // Insérer des acteurs
  const actorsQuery = `
    INSERT INTO actors (first_name, last_name, date_of_birth, date_of_death)
    VALUES (?, ?, ?, ?)
  `;
  const actorsData = [
    ['John', 'Doe', '1990-01-01', null],
    ['Jane', 'Smith', '1985-05-10', null],
    ['Michael', 'Johnson', '1978-09-15', null]
  ];
  actorsData.forEach(data => {
    db.run(actorsQuery, data, err => {
      if (err) {
        console.error('Error inserting actor:', err);
      }
    });
  });

  // Insérer des films
  const filmsQuery = `
    INSERT INTO films (name, synopsis, release_year, genre_id)
    VALUES (?, ?, ?, ?)
  `;
  const filmsData = [
    ['Film 1', 'Synopsis du Film 1', 2020, 1],
    ['Film 2', 'Synopsis du Film 2', 2018, 2],
    ['Film 3', 'Synopsis du Film 3', 2022, 1]
  ];
  filmsData.forEach(data => {
    db.run(filmsQuery, data, err => {
      if (err) {
        console.error('Error inserting film:', err);
      }
    });
  });
});
//Inserer des genres 
const genresQuery = `
    INSERT INTO genres (name)
    VALUES (?)
  `;
  const genresData = [
    ['Action'],
    ['Comedy'],
    ['Drama']
  ];
  genresData.forEach(data => {
    db.run(genresQuery, data, err => {
      if (err) {
        console.error('Error inserting genre:', err);
      }
    });
  });


app.listen(HTTP_PORT, () => {
  console.log(`Server running on port ${HTTP_PORT}`);
});

// Routes pour les acteurs
app.get('/api/actor', checkApiKey, addEtag, (req, res) => {
  const query = 'SELECT * FROM actors';
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/actor/:id', checkApiKey, addEtag, (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM actors WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (!row) {
      res.status(404).json({ error: 'Actor not found' });
    } else {
      res.json(row);
    }
  });
});

app.post('/api/actor', checkApiKey, (req, res) => {
  const { first_name, last_name, date_of_birth, date_of_death } = req.body;
  if (!first_name || !last_name || !date_of_birth) {
    res.status(400).json({ error: 'Missing required fields' });
  } else {
    const query = 'INSERT INTO actors (first_name, last_name, date_of_birth, date_of_death) VALUES (?, ?, ?, ?)';
    db.run(query, [first_name, last_name, date_of_birth, date_of_death], function (err) {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        const actorId = this.lastID;
        res.status(201).json({ id: actorId, first_name, last_name, date_of_birth, date_of_death });
      }
    });
  }
});

app.put('/api/actor/:id', checkApiKey, (req, res) => {
  const id = req.params.id;
  const { first_name, last_name, date_of_birth, date_of_death } = req.body;
  if (!first_name || !last_name || !date_of_birth) {
    res.status(400).json({ error: 'Missing required fields' });
  } else {
    const query = 'UPDATE actors SET first_name = ?, last_name = ?, date_of_birth = ?, date_of_death = ? WHERE id = ?';
    db.run(query, [first_name, last_name, date_of_birth, date_of_death, id], function (err) {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Actor not found' });
      } else {
        res.json({ id, first_name, last_name, date_of_birth, date_of_death });
      }
    });
  }
});

app.delete('/api/actor/:id', checkApiKey, (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM actors WHERE id = ?';
  db.run(query, [id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Actor not found' });
    } else {
      res.status(204).send();
    }
  });
});

// Routes pour les genres
app.get('/api/genre', checkApiKey, addEtag, (req, res) => {
  const query = 'SELECT * FROM genres';
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/genre', checkApiKey, (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Missing required fields' });
  } else {
    const query = 'INSERT INTO genres (name) VALUES (?)';
    db.run(query, [name], function (err) {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        const genreId = this.lastID;
        res.status(201).json({ id: genreId, name });
      }
    });
  }
});

app.delete('/api/genre/:id', checkApiKey, (req, res) => {
  const id = req.params.id;
  // Vérifier si le genre est utilisé dans un ou plusieurs films avant de le supprimer
  const checkQuery = 'SELECT COUNT(*) as count FROM films WHERE genre_id = ?';
  db.get(checkQuery, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (row.count > 0) {
      res.status(400).json({ error: 'Genre is used in one or more films' });
    } else {
      const deleteQuery = 'DELETE FROM genres WHERE id = ?';
      db.run(deleteQuery, [id], function (err) {
        if (err) {
          res.status(500).json({ error: 'Internal Server Error' });
        } else if (this.changes === 0) {
          res.status(404).json({ error: 'Genre not found' });
        } else {
          res.status(204).send();
        }
      });
    }
  });
});


// Routes pour les films
app.get('/api/film', checkApiKey, addEtag, (req, res) => {
  const query = 'SELECT * FROM films';
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/film/:id', checkApiKey, addEtag, (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM films WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (!row) {
      res.status(404).json({ error: 'Film not found' });
    } else {
      res.json(row);
    }
  });
});

app.post('/api/film', checkApiKey, (req, res) => {
  const { name, synopsis, release_year, genre_id } = req.body;
  if (!name || !synopsis || !release_year || !genre_id) {
    res.status(400).json({ error: 'Missing required fields' });
  } else {
    const query = 'INSERT INTO films (name, synopsis, release_year, genre_id) VALUES (?, ?, ?, ?)';
    db.run(query, [name, synopsis, release_year, genre_id], function (err) {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        const filmId = this.lastID;
        res.status(201).json({ id: filmId, name, synopsis, release_year, genre_id });
      }
    });
  }
});

app.put('/api/film/:id', checkApiKey, (req, res) => {
  const id = req.params.id;
  const { name, synopsis, release_year, genre_id } = req.body;
  if (!name || !synopsis || !release_year || !genre_id) {
    res.status(400).json({ error: 'Missing required fields' });
  } else {
    const query = 'UPDATE films SET name = ?, synopsis = ?, release_year = ?, genre_id = ? WHERE id = ?';
    db.run(query, [name, synopsis, release_year, genre_id, id], function (err) {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Film not found' });
      } else {
        res.json({ id, name, synopsis, release_year, genre_id });
      }
    });
  }
});

app.delete('/api/film/:id', checkApiKey, (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM films WHERE id = ?';
  db.run(query, [id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Film not found' });
    } else {
      res.status(204).send();
    }
  });
});

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.send('Bienvenue sur notre API !');
});

// Route pour toutes les autres requêtes
app.all('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

module.exports = app;
