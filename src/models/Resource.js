const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title:       { type: String, required: true, trim: true },
    url:         { type: String, required: false, default:null, trim: true },
    description: { type: String, default: null, trim: true },
    tags:        { type: [String], default: [] },
  },
  { timestamps: true }
);

resourceSchema.index({ title: "text" });

module.exports = mongoose.model("Resource", resourceSchema);
