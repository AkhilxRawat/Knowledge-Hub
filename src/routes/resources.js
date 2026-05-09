const router   = require("express").Router();
const auth     = require("../middleware/auth");
const Resource = require("../models/Resource");

const fmt = (r) => ({
  id:          r._id,
  user_id:     r.user,
  title:       r.title,
  url:         r.url,
  description: r.description,
  tags:        r.tags,
  created_at:  r.createdAt,
});

// GET /api/resources
router.get("/", auth, async (req, res) => {
  try {
    const { search, tags } = req.query;
    const query = { user: req.user.id };
    if (search) query.title = { $regex: search, $options: "i" };
    if (tags) query.tags = { $in: tags.split(",").map((t) => t.trim()) };

    const list = await Resource.find(query).sort({ createdAt: -1 });
    res.json(list.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/resources
router.post("/", auth, async (req, res) => {
  try {
    const { title, url, description, tags } = req.body;
    if (!title)
      return res.status(400).json({ error: "Title and URL are required" });

    const r = await Resource.create({ user: req.user.id, title, url, description: description || null, tags: tags || [] });
    res.status(201).json(fmt(r));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/resources/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const r = await Resource.findOne({ _id: req.params.id, user: req.user.id });
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json(fmt(r));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/resources/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, url, description, tags } = req.body;
    const r = await Resource.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { title, url, description: description || null, tags: tags || [] } },
      { new: true, runValidators: true }
    );
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json(fmt(r));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/resources/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const r = await Resource.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!r) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
