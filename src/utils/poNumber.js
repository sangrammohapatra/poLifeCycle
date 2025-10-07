// src/utils/poNumber.js
const PurchaseOrder = require("../models/purchaseOrder");

const generatePoNumber = async () => {
  const count = await PurchaseOrder.countDocuments({});
  const poNumber = `PO-${(count + 1).toString().padStart(5, "0")}`;
  return poNumber;
};

module.exports = { generatePoNumber };
