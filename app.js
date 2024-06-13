const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dbConfig = require('./config/db.config');

const app = express();
app.use(cors());
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
app.get('/empleados', (req, res) => {
    db.query('SELECT * FROM empleado WHERE estado=1', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Obtener un usuario por ID
app.get('/empleados/:id', (req, res) => {
    const userId = req.params.id;
    db.query('SELECT * FROM empleado WHERE id = ? AND estado=1', [userId], (err, results) => {
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
app.post('/empleados', (req, res) => {
    const { nombre, apellido, dpi, estado_civil, sueldo_mensual, descuentos, saldo_liquido } = req.body;
    db.query('INSERT INTO empleado (nombre, apellido, dpi, estado_civil, sueldo_mensual, descuentos, saldo_liquido, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())', [nombre, apellido, dpi, estado_civil, sueldo_mensual, descuentos, saldo_liquido], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId, nombre, apellido, dpi, estado_civil, sueldo_mensual, descuentos, saldo_liquido });
    });
});

app.put('/empleados/:id', (req, res) => {
    const userId = req.params.id;
    const { nombre, apellido, dpi, estado_civil, sueldo_mensual, descuentos, saldo_liquido } = req.body;
    db.query('UPDATE empleado SET nombre = ?, apellido = ?, dpi = ?, estado_civil = ?, sueldo_mensual = ?, descuentos = ?, saldo_liquido = ?, updated_at = now() WHERE id = ?', [nombre, apellido, dpi, estado_civil, sueldo_mensual, descuentos, saldo_liquido, userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ id: userId, nombre, apellido, dpi, estado_civil, sueldo_mensual, descuentos, saldo_liquido });
    });
});

// Eliminar un usuario
app.delete('/empleados/:id', (req, res) => {
    const userId = req.params.id;
    db.query('UPDATE empleado SET estado = 0, updated_at = now() WHERE id = ?', [userId], (err, results) => {
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
