const express = require('express');
const mysql = require('mysql2');
const dbConfig = require('./config/db.config');

const app = express();
const port = 3000;

// Configuración de la base de datos
const db = mysql.createConnection(dbConfig);

db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos MySQL');
});

app.use(express.json());

// Rutas
app.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Obtener un usuario por ID
app.get('/usuarios/:id', (req, res) => {
    const userId = req.params.id;
    db.query('SELECT * FROM usuarios WHERE id = ?', [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(results[0]);
    });
});

// Crear un nuevo usuario
app.post('/usuarios', (req, res) => {
    const { nombre, email } = req.body;
    db.query('INSERT INTO usuarios (nombre, email) VALUES (?, ?)', [nombre, email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId, nombre, email });
    });
});

app.put('/usuarios/:id', (req, res) => {
    const userId = req.params.id;
    const { nombre, email } = req.body;
    db.query('UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?', [nombre, email, userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ id: userId, nombre, email });
    });
});

// Eliminar un usuario
app.delete('/usuarios/:id', (req, res) => {
    const userId = req.params.id;
    db.query('DELETE FROM usuarios WHERE id = ?', [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(204).send();
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
