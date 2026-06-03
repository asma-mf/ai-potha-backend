require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const connectDB = require("./config/db");
const counterRoute = require("./counter.route");

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── CORS ────────────────────────────────────────────────────
// Build allowed origins. Strip trailing slash from CLIENT_URL if present.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://ai-potha-frontend-test.pages.dev"
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ""));
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// ─── Routes ──────────────────────────────────────────────────
app.use("/api/counter", counterRoute);

// Health check — confirms the server is alive
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Potha Backend",
    endpoints: {
      increment: "POST /api/counter/increment",
      stats:     "GET  /api/counter/stats",
    },
  });
});

module.exports = app;
