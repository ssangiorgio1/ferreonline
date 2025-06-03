import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Ruta para registrar un nuevo cliente
router.post('/', async (req, res) => {
  const { nombre_apellido, direccion, telefono, correo, contraseña } = req.body;

  if (!nombre_apellido || !direccion || !telefono || !correo || !contraseña) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO clien (nombre_apellido, direccion, telefono, correo, contraseña) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre_apellido, direccion, telefono, correo, contraseña]
    );

    res.status(201).json({ message: 'Cliente registrado con éxito', cliente: result.rows[0] });
  } catch (err) {
    console.error('Error al registrar cliente:', err);
    res.status(500).json({ error: 'Error al registrar el cliente' });
  }
});

export default router;
