const express = require("express");
const cors    = require("cors");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT       = process.env.PORT       || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const MONGO_URI  = process.env.MONGO_URI;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// ── MongoDB Connection ────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅  MongoDB connected"))
  .catch((err) => { console.error("❌  MongoDB connection error:", err.message); process.exit(1); });

// ── Schemas & Models ──────────────────────────────────────────────────────────

// User Schema
const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model("User", userSchema);

// Resource Schema
const resourceSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title:       { type: String, required: true, trim: true },
    url:         { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    tags:        { type: [String], default: [] },
  },
  { timestamps: true }   // createdAt + updatedAt auto-managed
);

// Text index for search on title
resourceSchema.index({ title: "text" });

const Resource = mongoose.model("Resource", resourceSchema);

// ── Helper: format resource for API response ──────────────────────────────────
const fmt = (r) => ({
  id:          r._id,
  user_id:     r.user,
  title:       r.title,
  url:         r.url,
  description: r.description,
  tags:        r.tags,
  created_at:  r.createdAt,
});

// ── Auth Middleware ───────────────────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── Auth Routes ───────────────────────────────────────────────────────────────
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    if (await User.findOne({ email }))
      return res.status(400).json({ error: "Email already registered" });

    const user  = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Resource Routes ───────────────────────────────────────────────────────────
app.get("/api/resources", auth, async (req, res) => {
  try {
    const { search, tags } = req.query;
    const query = { user: req.user.id };

    if (search) query.title = { $regex: search, $options: "i" };
    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      query.tags = { $in: tagList };
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    res.json(resources.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/resources", auth, async (req, res) => {
  try {
    const { title, url, description, tags } = req.body;
    if (!title || !url)
      return res.status(400).json({ error: "Title and URL are required" });

    const resource = await Resource.create({
      user: req.user.id,
      title,
      url,
      description: description || null,
      tags: tags || [],
    });

    res.status(201).json(fmt(resource));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/resources/:id", auth, async (req, res) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, user: req.user.id });
    if (!resource) return res.status(404).json({ error: "Not found" });
    res.json(fmt(resource));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/resources/:id", auth, async (req, res) => {
  try {
    const { title, url, description, tags } = req.body;
    const resource = await Resource.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { title, url, description: description || null, tags: tags || [] } },
      { new: true, runValidators: true }
    );
    if (!resource) return res.status(404).json({ error: "Not found" });
    res.json(fmt(resource));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/resources/:id", auth, async (req, res) => {
  try {
    const resource = await Resource.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!resource) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/health", async (_, res) => {
  const dbState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({ status: "ok", db: dbState });
});

app.listen(PORT, () =>
  console.log(`✅  API running at http://localhost:${PORT}`)
);
