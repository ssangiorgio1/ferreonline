import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();

// ⚠️ Reemplazá esto si tu frontend está en otra URL:
const CLIENT_ORIGIN = 'https://ferreonline.vercel.app';

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Ruta de prueba para verificar que el servidor esté funcionando
app.get('/api', (req, res) => {
  res.send('API funcionando correctamente 🚀');
});

// Ruta POST para registrar cliente
app.post('/api/register', async (req, res) => {
  const { name, address, phone, email, password } = req.body;

  if (!name || !address || !phone || !email || !password) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
  }

  try {
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

// Inicializar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
