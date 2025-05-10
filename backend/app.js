require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const projectRoutes = require ('./routes/project')


const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

// Connection
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected!!"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); 
  });

// Routes
app.use("/api/users", authRoutes);
app.use("/api/projects", projectRoutes);


//Example
app.get("/", (req, res) => {
  res.send("Welcome to the Construction Management API!");
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
