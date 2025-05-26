const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const verifyToken = require("../middleware/auth");
const User = require("../models/User");

// Supervisor - create project
router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== "supervisor") {
    return res.status(403).json({ message: "Only supervisor can create project" });
  }

  const { name, description, type, assignedTo, status, duration, budget } = req.body;

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
    res.status(500).json({ message: "Error creating project", error: err.message });
  }
});

// Technician - view assigned projects
router.get("/my-projects", verifyToken, async (req, res) => {
  if (req.user.role !== "technician") {
    return res.status(403).json({ message: "Only technician can view projects" });
  }

  try {
    const projects = await Project.find({ assignedTo: req.user.id })
      .populate("createdBy", "username email")
      .populate("assignedTo", "username email");

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: "Error fetching projects", error: err.message });
  }
});

// Supervisor - view all created projects
router.get("/dashboard", verifyToken, async (req, res) => {
  if (req.user.role !== "supervisor") {
    return res.status(403).json({ message: "Only supervisor can view dashboard" });
  }

  try {
    const projects = await Project.find({ createdBy: req.user.id })
      .populate("assignedTo", "username email");

    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard projects", error: err.message });
  }
});

// Supervisor - Add technician to project
router.post("/:projectId/add-member", verifyToken, async (req, res) => {
  if (req.user.role !== "supervisor") {
    return res.status(403).json({ message: "Only supervisors can add members to projects" });
  }

  const { email } = req.body;
  const { projectId } = req.params;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "technician") {
      return res.status(400).json({ message: "Only technicians can be added to a project" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!Array.isArray(project.assignedTo)) {
      project.assignedTo = [];
    }

    if (project.assignedTo.includes(user._id)) {
      return res.status(400).json({ message: "Technician already assigned to this project" });
    }

    project.assignedTo.push(user._id);
    await project.save();

    res.status(200).json({ message: "Technician added to project", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
