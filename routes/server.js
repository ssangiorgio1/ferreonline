import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import registerRoutes from './routes/register.js';

dotenv.config();
const app = express();

const CLIENT_ORIGIN = 'https://ferreonline.vercel.app';
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Test
app.get('/api', (req, res) => {
  res.send('API funcionando correctamente 🚀');
});

// Rutas separadas
app.use('/api/register', registerRoutes);

// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
