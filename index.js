import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

console.log('🚀 Iniciando aplicación...');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('✅ Express y dotenv cargados');

// ✅ CORS configurado para permitir el frontend de Vercel
const corsOptions = {
  origin: 'https://ferreonline.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

console.log('✅ Middleware básico configurado');

// Intentar cargar rutas una por una para ver cuál falla
try {
  console.log('📦 Cargando productosRoutes...');
  const productosRoutes = await import('./routes/productos.js');
  app.use('/api/productos', productosRoutes.default);
  console.log('✅ productosRoutes cargado');
} catch (error) {
  console.error('❌ Error cargando productosRoutes:', error);
}

try {
  console.log('📦 Cargando serverRoutes...');
  const serverRoutes = await import('./routes/server.js');
  app.use('/api/clientes', serverRoutes.default);
  console.log('✅ serverRoutes cargado');
} catch (error) {
  console.error('❌ Error cargando serverRoutes:', error);
}

try {
  console.log('📦 Cargando registerRoutes...');
  const registerRoutes = await import('./routes/register.js');
  app.use('/api/register', registerRoutes.default);
  console.log('✅ registerRoutes cargado correctamente');
} catch (error) {
  console.error('❌ ERROR CRÍTICO cargando registerRoutes:', error);
  console.error('❌ Stack:', error.stack);
}

try {
  console.log('📦 Cargando MercadoPago...');
  const { MercadoPagoConfig, Preference } = await import('mercadopago');
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
  const preferenceClient = new Preference(client);
  console.log('✅ MercadoPago cargado');

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
} catch (error) {
  console.error('❌ Error cargando MercadoPago:', error);
}

// Ruta base
app.get('/', (req, res) => {
  console.log('🏠 Petición a ruta base');
  res.send('API de FerreOnline funcionando 🎉');
});

// Ruta de debug para ver qué rutas están registradas
app.get('/debug', (req, res) => {
  console.log('🔍 Petición a debug');
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router' && middleware.regexp) {
      // Extraer el path del router desde la expresión regular
      const match = middleware.regexp.toString().match(/^\/\^\\?(.*?)\\\?\$\//);
      if (match) {
        routes.push(`ROUTER ${match[1].replace(/\\\//g, '/')}`);
      }
    }
  });
  res.json({ routes, message: 'Rutas registradas en el servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`🌐 URL: https://ferreonline-production.up.railway.app`);
  console.log('🔧 Servidor listo para recibir peticiones');
});