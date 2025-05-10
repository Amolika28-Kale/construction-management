const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const verifyToken = require("../middleware/auth");

// Supervisor - create project
router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== "supervisor") {
    return res
      .status(403)
      .json({ message: "Only supervisor can create project" });
  }

  const { name, description, type, assignedTo, status, duration, budget } =
    req.body;
  console.log("User:", req.user);

  try {
    const project = new Project({
      name,
      description,
      type,
      assignedTo,
      createdBy: req.user.id,
      status,
      duration,
      budget,
    });

    await project.save();
    res.status(201).json({ message: "Project created successfully", project });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating project", error: err.message });
  }
});

// Technician - view assigned projects
router.get("/my-projects", verifyToken, async (req, res) => {
  if (req.user.role !== "technician") {
    return res
      .status(403)
      .json({ message: "Only technician can view projects" });
  }

  try {
    const projects = await Project.find({ assignedTo: req.user.id });
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: "Error fetching projects" });
  }
});

// Supervisor - view all created projects (dashboard)
router.get("/dashboard", verifyToken, async (req, res) => {
  if (req.user.role !== "supervisor") {
    return res
      .status(403)
      .json({ message: "Only supervisor can view dashboard" });
  }

  try {
    const projects = await Project.find({
      createdBy: req.user.id,
    }).populate("assignedTo", "username");
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard projects" });
  }
});

module.exports = router;
