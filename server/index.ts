import express, { NextFunction, Response, type Request } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { log, serveStatic, setupVite } from "./vite";

// Create express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize session before any routes
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || typeof sessionSecret !== 'string' || sessionSecret.length === 0) {
  console.error(`
ERROR: Missing or invalid SESSION_SECRET environment variable

Please set the SESSION_SECRET environment variable before starting the server:

For Windows (Command Prompt):
    set SESSION_SECRET=my-development-secret-key
    npm run dev

For Windows (PowerShell):
    $env:SESSION_SECRET="my-development-secret-key"
    npm run dev

For Linux/Mac:
    export SESSION_SECRET=my-development-secret-key
    npm run dev

Make sure to run these commands in the same terminal window where you'll start the server.
`);
  process.exit(1);
}

// Basic session configuration
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: storage.sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log('Starting server with session secret:', sessionSecret.substring(0, 3) + '...');
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error(err);
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();