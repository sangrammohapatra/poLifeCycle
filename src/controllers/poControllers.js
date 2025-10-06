const { PurchaseOrder, PoHistory, User } = require("../models");
const generatePoNumber = require("../utils/poNumber");
const { Op } = require("sequelize");

/* Create PO as DRAFT */
async function createPO(req, res) {
  try {
    const { items, totalAmount } = req.body;
    if (!Array.isArray(items))
      return res.status(400).json({ message: "Items must be array" });

    const po = await PurchaseOrder.create({
      poNumber: generatePoNumber(),
      items,
      totalAmount,
      createdById: req.user.id,
      status: "DRAFT",
    });

    await PoHistory.create({
      poId: po.id,
      action: "CREATED",
      comment: `PO created by ${req.user.name}`,
      performedById: req.user.id,
    });

    return res.status(201).json(po);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
}

/* Update PO when DRAFT and owner */
async function updatePO(req, res) {
  try {
    const poId = req.params.id;
    const { items, totalAmount } = req.body;
    const po = await PurchaseOrder.findByPk(poId);
    if (!po) return res.status(404).json({ message: "PO not found" });
    if (po.createdById !== req.user.id)
      return res.status(403).json({ message: "Not owner" });
    if (po.status !== "DRAFT")
      return res.status(400).json({ message: "Only DRAFT PO can be edited" });

    po.items = items ?? po.items;
    po.totalAmount = totalAmount ?? po.totalAmount;
    await po.save();

    await PoHistory.create({
      poId: po.id,
      action: "COMMENT",
      comment: `PO updated by ${req.user.name}`,
      performedById: req.user.id,
    });

    return res.json(po);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
}

/* Submit PO for approval */
async function submitPO(req, res) {
  try {
    const poId = req.params.id;
    const { comment } = req.body;
    const po = await PurchaseOrder.findByPk(poId);
    if (!po) return res.status(404).json({ message: "PO not found" });
    if (po.createdById !== req.user.id)
      return res.status(403).json({ message: "Only owner can submit" });
    if (po.status !== "DRAFT")
      return res.status(400).json({ message: "Only DRAFT can be submitted" });

    po.status = "SUBMITTED";
    po.submittedById = req.user.id;
    po.submittedAt = new Date();
    await po.save();

    await PoHistory.create({
      poId: po.id,
      action: "SUBMITTED",
      comment: comment || `Submitted by ${req.user.name}`,
      performedById: req.user.id,
    });

    return res.json({ message: "PO submitted", po });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
}

/* Approve PO */
async function approvePO(req, res) {
  try {
    const poId = req.params.id;
    const { comment } = req.body;

    const po = await PurchaseOrder.findByPk(poId);
    if (!po) return res.status(404).json({ message: "PO not found" });
    if (po.status !== "SUBMITTED")
      return res
        .status(400)
        .json({ message: "Only SUBMITTED PO can be approved" });

    // role check is done by middleware but double-check:
    if (!["approver", "admin"].includes(req.user.role))
      return res.status(403).json({ message: "Not an approver" });

    po.status = "APPROVED";
    po.approvedById = req.user.id;
    po.approvedAt = new Date();
    await po.save();

    await PoHistory.create({
      poId: po.id,
      action: "APPROVED",
      comment: comment || `Approved by ${req.user.name}`,
      performedById: req.user.id,
    });

    return res.json({ message: "PO approved", po });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
}

/* Reject PO */
async function rejectPO(req, res) {
  try {
    const poId = req.params.id;
    const { comment, rejectionReason } = req.body;

    const po = await PurchaseOrder.findByPk(poId);
    if (!po) return res.status(404).json({ message: "PO not found" });
    if (po.status !== "SUBMITTED")
      return res
        .status(400)
        .json({ message: "Only SUBMITTED PO can be rejected" });

    if (!["approver", "admin"].includes(req.user.role))
      return res.status(403).json({ message: "Not an approver" });

    po.status = "REJECTED";
    po.rejectionReason = rejectionReason ?? null;
    po.approvedById = req.user.id; // who rejected
    po.approvedAt = new Date();
    await po.save();

    await PoHistory.create({
      poId: po.id,
      action: "REJECTED",
      comment:
        comment || `Rejected by ${req.user.name} - ${rejectionReason || ""}`,
      performedById: req.user.id,
    });

    return res.json({ message: "PO rejected", po });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
}

/* Add comment to PO (any role) */
async function addComment(req, res) {
  try {
    const poId = req.params.id;
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ message: "Comment required" });

    const po = await PurchaseOrder.findByPk(poId);
    if (!po) return res.status(404).json({ message: "PO not found" });

    const hist = await PoHistory.create({
      poId: po.id,
      action: "COMMENT",
      comment,
      performedById: req.user.id,
    });

    return res.status(201).json(hist);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
}

/* List PO (dashboard) - basic filters, includes last activity */
async function listPOs(req, res) {
  try {
    const { status, createdBy } = req.query;
    const where = {};
    if (status) where.status = status;
    if (createdBy) where.createdById = createdBy;

    const pos = await PurchaseOrder.findAll({
      where,
      include: [
        { model: User, as: "createdBy", attributes: ["id", "name", "email"] },
        {
          model: PoHistory,
          as: "history",
          limit: 10,
          order: [["createdAt", "DESC"]],
          include: [
            { model: User, as: "performedBy", attributes: ["id", "name"] },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(pos);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
}

/* Get single PO details with full history */
async function getPoDetails(req, res) {
  try {
    const poId = req.params.id;
    const po = await PurchaseOrder.findByPk(poId, {
      include: [
        { model: User, as: "createdBy", attributes: ["id", "name", "email"] },
        {
          model: PoHistory,
          as: "history",
          include: [
            { model: User, as: "performedBy", attributes: ["id", "name"] },
          ],
          order: [["createdAt", "DESC"]],
        },
      ],
    });
    if (!po) return res.status(404).json({ message: "PO not found" });
    return res.json(po);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
}

module.exports = {
  createPO,
  updatePO,
  submitPO,
  approvePO,
  rejectPO,
  addComment,
  listPOs,
  getPoDetails,
};
