// src/models/poHistory.js
const mongoose = require("mongoose");

const poHistorySchema = new mongoose.Schema(
  {
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
    },
    action: {
      type: String,
      enum: ["Created", "Submitted", "Approved", "Rejected"],
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: {
      type: String,
    },
  },
  { timestamps: true }
);

const PoHistory = mongoose.model("PoHistory", poHistorySchema);
module.exports = PoHistory;
