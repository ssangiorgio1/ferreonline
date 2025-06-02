import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productosRoutes from './routes/productos.js';
import serverRoutes from './routes/server.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS configurado para permitir el frontend de Vercel
const corsOptions = {
  origin: 'https://ferreonline.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

// ✅ Configuración MercadoPago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const preferenceClient = new Preference(client);

// 🛒 Rutas de productos y clientes
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', serverRoutes);

// 🧩 Ruta para crear preferencia de pago
app.post('/api/crear-preferencia', async (req, res) => {
  try {
    const { carrito } = req.body;

    const items = carrito.map(item => ({
      title: item.nombre.trim(),
      unit_price: Number(item.precio),
      quantity: Number(item.cantidad),
      currency_id: 'ARS',
    }));

    console.log('Items que vamos a enviar a Mercado Pago:', items);

    const preference = await preferenceClient.create({
      body: {
        items,
        back_urls: {
          success: 'https://ferreonline.vercel.app/success.html',
          failure: 'https://ferreonline.vercel.app/failure.html',
          pending: 'https://ferreonline.vercel.app/pending.html',
        },
        auto_return: 'approved',
      }
    });

    console.log('Preference creada:', preference);

    res.json({ init_point: preference.init_point });
  } catch (error) {
    console.error('Error al crear preferencia:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

// Ruta base
app.get('/', (req, res) => {
  res.send('API de FerreOnline funcionando 🎉');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
