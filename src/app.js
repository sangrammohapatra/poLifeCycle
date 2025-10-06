const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const poRoutes = require("./routes/poRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/po", poRoutes);

app.get("/", (req, res) => res.send("PO App API is running"));

module.exports = app;
