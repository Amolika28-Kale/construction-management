const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: { 
    type: String,
    enum: ["ongoing", "completed"],
    default: "ongoing",
  },
  duration: {
    type: String,
  },
  budget: {
    type: Number,
  },
});

module.exports = mongoose.model("Project", projectSchema);
