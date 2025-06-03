import express from 'express';
import { pool } from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, address, phone, email, password } = req.body;

  if (!name || !address || !phone || !email || !password) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO clien (nombre_apellido, direccion, telefono, correo, contraseña)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name, address, phone, email, hashedPassword]
    );

    res.status(201).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('Error al registrar cliente:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

export default router;
