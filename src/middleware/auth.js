const jwt = require("jsonwebtoken");
require("dotenv").config();
const { User } = require("../models");

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Missing Authorization header" });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Invalid Authorization header" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    };
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid token", details: err.message });
  }
}

module.exports = authenticate;
