// src/controllers/poController.js
const PurchaseOrder = require("../models/purchaseOrder");
const PoHistory = require("../models/poHistory");
const { generatePoNumber } = require("../utils/poNumber");

// @desc    Create a new Purchase Order (Persona 1)
// @route   POST /api/pos
// @access  Private (creator)
const createPO = async (req, res) => {
  const { vendor, description, items } = req.body;
  const creator = req.user._id;

  const poNumber = await generatePoNumber();
  const amount = items.reduce((sum, item) => sum + item.total, 0);

  const po = await PurchaseOrder.create({
    poNumber,
    vendor,
    description,
    items,
    amount,
    creator,
    status: "Draft",
  });

  await PoHistory.create({
    purchaseOrder: po._id,
    action: "Created",
    actor: creator,
    comments: "Purchase Order created.",
  });

  res.status(201).json(po);
};

// @desc    Submit a Purchase Order for approval (Persona 1)
// @route   PUT /api/pos/:id/submit
// @access  Private (creator)
const submitPO = async (req, res) => {
  const po = await PurchaseOrder.findById(req.params.id);

  if (!po) {
    return res.status(404).json({ message: "PO not found" });
  }

  if (po.creator.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to submit this PO" });
  }

  if (po.status !== "Draft") {
    return res
      .status(400)
      .json({ message: "PO can only be submitted from Draft status" });
  }

  po.status = "Submitted";
  await po.save();

  await PoHistory.create({
    purchaseOrder: po._id,
    action: "Submitted",
    actor: req.user._id,
    comments: "Purchase Order submitted for approval.",
  });

  res.json(po);
};

// @desc    Approve a Purchase Order (Persona 2)
// @route   PUT /api/pos/:id/approve
// @access  Private (approver)
const approvePO = async (req, res) => {
  const { comments } = req.body;
  const po = await PurchaseOrder.findById(req.params.id);

  if (!po) {
    return res.status(404).json({ message: "PO not found" });
  }

  if (po.status !== "Submitted") {
    return res
      .status(400)
      .json({ message: "PO can only be approved from Submitted status" });
  }

  po.status = "Approved";
  await po.save();

  await PoHistory.create({
    purchaseOrder: po._id,
    action: "Approved",
    actor: req.user._id,
    comments: comments || "Purchase Order approved.",
  });

  res.json(po);
};

// @desc    Reject a Purchase Order (Persona 2)
// @route   PUT /api/pos/:id/reject
// @access  Private (approver)
const rejectPO = async (req, res) => {
  const { comments } = req.body;
  if (!comments) {
    return res.status(400).json({ message: "Rejection comments are required" });
  }

  const po = await PurchaseOrder.findById(req.params.id);

  if (!po) {
    return res.status(404).json({ message: "PO not found" });
  }

  if (po.status !== "Submitted") {
    return res
      .status(400)
      .json({ message: "PO can only be rejected from Submitted status" });
  }

  po.status = "Rejected";
  await po.save();

  await PoHistory.create({
    purchaseOrder: po._id,
    action: "Rejected",
    actor: req.user._id,
    comments: comments,
  });

  res.json(po);
};

// @desc    Get a list of all POs (Dashboard)
// @route   GET /api/pos
// @access  Private (all roles)
const getPOs = async (req, res) => {
  const pos = await PurchaseOrder.find({})
    .populate("creator", "username role")
    .sort({ createdAt: -1 });
  res.json(pos);
};

// @desc    Get history for a specific PO
// @route   GET /api/pos/:id/history
// @access  Private (all roles)
const getPOHistory = async (req, res) => {
  const history = await PoHistory.find({ purchaseOrder: req.params.id })
    .populate("actor", "username role")
    .sort({ createdAt: 1 });
  res.json(history);
};

module.exports = {
  createPO,
  submitPO,
  approvePO,
  rejectPO,
  getPOs,
  getPOHistory,
};
