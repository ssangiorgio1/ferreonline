import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Ruta POST para registrar cliente
router.post('/api/register', async (req, res) => {
  const { name, address, phone, email, password } = req.body;

  if (!name || !address || !phone || !email || !password) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
  }

  try {
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO clien (nombre_apellido, direccion, telefono, correo, contraseña)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    const values = [name, address, phone, email, hashedPassword];

    const result = await pool.query(query, values);

    res.status(201).json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

export default router;
