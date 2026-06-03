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
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Routes
app.use("/api/counter", counterRoute);

module.exports = app;
