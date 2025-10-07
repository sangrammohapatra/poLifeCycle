const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");
const poRoutes = require("./routes/poRoutes");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Purchase Order API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/pos", poRoutes);

module.exports = app;
