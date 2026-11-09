import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import winston from 'winston';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
import { createRequire } from 'module';

// We'll dynamically load route modules at runtime (supports ts-node --esm and CJS modules)

// Middleware will be loaded dynamically inside startServer to support ts-node --esm

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.simple()
  ),
  defaultMeta: { service: 'refugee-aid-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ],
});

// CORS configuration
const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Allow requests with no origin (mobile apps, curl requests, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, you might want to restrict origins
    const allowedOrigins = process.env.FRONTEND_URL?.split(',') || [];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(null, true); // For now, allow all origins
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Compute __dirname in an ESM-compatible way so static file serving works under --esm
// Compute filename/dirname from import.meta.url (ESM-safe)
const __filename = fileURLToPath(import.meta.url);
const __dirname_esm = path.dirname(__filename);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Refugee Aid API', version: process.env.npm_package_version || '1.0.0' });
}
);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname_esm, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Alias health endpoint under /api so clients calling /api/health get the same response
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes will be mounted dynamically in startServer() so ts-node --esm can resolve .ts files

// 404 handler and error handler will be mounted after routes are dynamically loaded in startServer()

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });

    logger.info('✅ Connected to MongoDB');
  } catch (error: unknown) {
    logger.error('❌ MongoDB connection error:', error);

    try {
      const raw = process.env.MONGODB_URI || '';
      // strip surrounding quotes if present
      const cleaned = raw.replace(/^"|"$/g, '');
      let host = cleaned;
      let user = '<unknown>';
      try {
        const u = new URL(cleaned);
        host = u.host || host;
        user = u.username || user;
      } catch (_) {
        // ignore parse errors
      }

      logger.error(`MongoDB connection diagnostics: host=${host}, user=${user}`);

      // If authentication error, give actionable guidance
      let msg = '';
      if (error instanceof Error) {
        msg = error.message || String(error);
      } else {
        try {
          msg = JSON.stringify(error as any);
        } catch (e) {
          msg = String(error);
        }
      }
      if (/auth|authentication|Authentication failed|bad auth/i.test(msg)) {
        logger.error('MongoDB authentication failed. Common fixes:');
        logger.error('- Verify the username and password are correct in your .env (MONGODB_URI).');
        logger.error('- If the password contains special characters, URL-encode them (e.g. %40 for @).');
        logger.error('- Remove surrounding quotes from the MONGODB_URI in .env if present.');
        logger.error('- Ensure your IP is allowed in the Atlas Network Access (or add 0.0.0.0/0 temporarily for development).');
        logger.error('- Ensure the connection string contains the correct default database and options (e.g. ?retryWrites=true&w=majority).');
      }
    } catch (diagErr) {
      logger.warn('Failed to produce MongoDB diagnostics', diagErr);
    }

    process.exit(1);
  }
};

// Keep a reference to the HTTP server so we can shut it down gracefully
let server: any = null;

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Graceful shutdown...`);

  if (server && typeof server.close === 'function') {
    server.close(() => {
      logger.info('HTTP server closed');

      mongoose.connection.close(false).then(() => {
        logger.info('MongoDB connection closed');
        process.exit(0);
      }).catch((err) => {
        logger.error('Error closing MongoDB connection', err);
        process.exit(1);
      });
    });
  } else {
    // If server is not running, still close DB and exit
    mongoose.connection.close(false).then(() => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    }).catch((err) => {
      logger.error('Error closing MongoDB connection', err);
      process.exit(1);
    });
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();

    // Dynamically import route modules so ts-node --esm can resolve .ts files
    const requireFn = createRequire(import.meta.url);

    const loadModule = async (relativePath: string) => {
      try {
        // convert to file URL to allow ESM loader to locate .ts files under ts-node --esm
        const url = pathToFileURL(path.join(__dirname_esm, relativePath)).href;
        const mod = await import(url);
        return (mod && (mod.default ?? mod)) as any;
      } catch (err) {
        // If the path looks like a TypeScript/ESM module, rethrow the import error
        if (/\.m?ts?$/.test(relativePath)) {
          logger.error(`Failed to import ESM module ${relativePath}`, err);
          throw err;
        }
        // fallback to CJS require for .js files or other cases
        try {
          return requireFn(path.join(__dirname_esm, relativePath));
        } catch (err2) {
          logger.error(`Failed to load module ${relativePath}`, err2);
          throw err2;
        }
      }
    };

    // Load and mount route modules
  const authRoutes = await loadModule('./src/routes/auth.routes.ts');
  const userRoutes = await loadModule('./src/routes/user.routes.ts');
  const identityRoutes = await loadModule('./src/routes/identity.routes.ts');
  const resourceRoutes = await loadModule('./src/routes/resource.routes.ts');
  const applicationRoutes = await loadModule('./src/routes/application.routes.ts');
  const newsRoutes = await loadModule('./src/routes/news.routes.ts');
  const alertsRoutes = await loadModule('./src/routes/alerts.routes.ts');

  // Log loaded modules for debugging
  logger.info('Loaded route modules: ' + [
    authRoutes ? 'auth' : 'auth(loaded-failed)',
    userRoutes ? 'user' : 'user(loaded-failed)',
    identityRoutes ? 'identity' : 'identity(loaded-failed)',
    resourceRoutes ? 'resources' : 'resources(loaded-failed)',
    applicationRoutes ? 'applications' : 'applications(loaded-failed)',
    newsRoutes ? 'news' : 'news(loaded-failed)',
    alertsRoutes ? 'alerts' : 'alerts(loaded-failed)'
  ].join(', '));

    // Load middleware (rate limiter and error handler) dynamically
    let rateLimiter: any = null;
    let errorHandler: any = null;
    try {
  rateLimiter = await loadModule('./src/middleware/rateLimiter.middleware.ts');
    } catch (err) {
      // not fatal; we'll continue
      logger.warn('rateLimiter middleware not loaded (continuing without rate limiter)');
    }

    try {
  errorHandler = await loadModule('./src/middleware/error.middleware.ts');
    } catch (err) {
      logger.warn('error middleware not loaded (using default)');
    }

    // Rate limiting
    if (process.env.NODE_ENV === 'production' && rateLimiter) {
      app.use('/api/', rateLimiter);
    }

    // Mount API routes
    app.use('/api/auth', authRoutes as any);
    app.use('/api/user', userRoutes as any);
    app.use('/api/identity', identityRoutes as any);
    app.use('/api/resources', resourceRoutes as any);
    app.use('/api/applications', applicationRoutes as any);
  app.use('/api/news', newsRoutes as any);
  logger.info('Mounted /api/news');
  app.use('/api/alerts', alertsRoutes as any);
  logger.info('Mounted /api/alerts');

    // 404 handler (use no-path app.use to avoid path-to-regexp parsing)
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    });

    // Error handling middleware (must be last)
    if (errorHandler) {
      app.use(errorHandler);
    }

    // Assign to top-level server variable so other parts of the app can reference it
    server = app.listen(PORT as number, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  try {
    if (reason instanceof Error) {
      logger.error('Unhandled Rejection reason (Error):', reason.stack || reason.message || reason);
      // also print to console so ts-node shows it plainly
      console.error('Unhandled Rejection (Error):', reason.stack || reason.message || reason);
    } else {
      // Non-Error rejection (could be object)
      try {
        const serialized = JSON.stringify(reason, Object.getOwnPropertyNames(reason));
        logger.error('Unhandled Rejection (non-error):', serialized);
        console.error('Unhandled Rejection (non-error):', serialized);
      } catch (e) {
        logger.error('Unhandled Rejection (could not serialize):', reason);
        console.error('Unhandled Rejection (could not serialize):', reason);
      }
    }
    logger.error('Unhandled rejection at promise:', String(promise));
  } catch (logErr) {
    // If logging fails, fall back to console
    console.error('Error while logging unhandledRejection:', logErr);
    console.error('Original unhandledRejection:', reason, promise);
  }
  // exit - preserve previous behavior
  process.exit(1);
});

// Start the server (do not shadow the `server` variable)
startServer().catch((err) => {
  console.error('Failed to start server:', err && (err.stack || err));
  try {
    logger.error('Failed to start server:', err && (err.stack || err));
  } catch (e) {
    console.error('Logger failed while reporting startServer error:', e);
  }
  process.exit(1);
});

// ESM export
export default app;
