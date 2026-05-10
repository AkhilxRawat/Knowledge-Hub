require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",      require("./routes/auth"));
app.use("/api/resources", require("./routes/resources"));
app.get("/api/health",    (_, res) => res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB connected");
    app.listen(process.env.PORT || 4000, () =>
      console.log(`✅  API running → http://localhost:${process.env.PORT || 4000}`)
    );
  })
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    console.error("👉  Check your MONGO_URI in .env — replace <db_password> with your real password");
    process.exit(1);
  });
