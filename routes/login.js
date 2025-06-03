import express from 'express';
import { pool } from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Faltan email o contraseña' });
  }

  try {
    // Buscar usuario por correo
    const result = await pool.query('SELECT * FROM clien WHERE correo = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Correo no registrado' });
    }

    const usuario = result.rows[0];

    // Comparar contraseña hasheada
    const passwordCorrecta = await bcrypt.compare(password, usuario.contraseña);

    if (!passwordCorrecta) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    // Si todo es correcto
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      cliente: {
        id: usuario.id,
        nombre_apellido: usuario.nombre_apellido,
        correo: usuario.correo
      }
    });

  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

export default router;
