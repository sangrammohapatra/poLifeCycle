// src/routes/poRoutes.js
const express = require("express");
const router = express.Router();
const {
  createPO,
  submitPO,
  approvePO,
  rejectPO,
  getPOs,
  getPOHistory,
} = require("../controllers/poController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get("/", protect, getPOs);
router.get("/:id/history", protect, getPOHistory);
router.post("/", protect, authorizeRoles("creator"), createPO);
router.put("/:id/submit", protect, authorizeRoles("creator"), submitPO);
router.put(
  "/:id/approve",
  protect,
  authorizeRoles("approver", "admin"),
  approvePO
);
router.put(
  "/:id/reject",
  protect,
  authorizeRoles("approver", "admin"),
  rejectPO
);

module.exports = router;
