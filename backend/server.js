import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import urlRoutes from "./routes/url.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

// Fail fast on missing configuration instead of starting a half-working server.
const REQUIRED_ENV = ["MONGO_URL", "JWT_SECRET", "BASE_URL", "FRONTEND_URL"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Render (and most hosts) sit behind a proxy. Without this, every visitor
// looks like the same IP to the rate limiter.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL.trim(),
    methods: ["GET", "POST"],
  }),
);
app.use(express.json({ limit: "10kb" }));

const json429 = (message) => (req, res) => res.status(429).json({ error: message });

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: json429("Too many attempts. Please wait 15 minutes and try again."),
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: json429("Too many requests. Please try again later."),
});

// Redirects get a much higher limit so a popular short link keeps working.
const redirectLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.get("/health", (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({ status: dbReady ? "ok" : "db_unavailable" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use(["/shorten", "/api"], apiLimiter);
app.use(urlRoutes(redirectLimiter));

mongoose
  .connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 15000 })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    // Exit so the host marks the deploy as failed (and shows this in the logs)
    // instead of hanging forever with no open port.
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  });
