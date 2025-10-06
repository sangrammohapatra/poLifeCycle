const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

// In production, you might disable open registration
router.post("/register", register);
router.post("/login", login);

module.exports = router;
