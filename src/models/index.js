const sequelize = require("../config/db");
const User = require("./User");
const PurchaseOrder = require("./purchaseOrder");
const PoHistory = require("./poHistory");

// Initialize models
const models = {
  User: User(sequelize),
  PurchaseOrder: PurchaseOrder(sequelize),
  PoHistory: PoHistory(sequelize),
};

// Associations
models.User.hasMany(models.PurchaseOrder, {
  foreignKey: "createdById",
  as: "createdPOs",
});
models.PurchaseOrder.belongsTo(models.User, {
  foreignKey: "createdById",
  as: "createdBy",
});

models.PurchaseOrder.hasMany(models.PoHistory, {
  foreignKey: "poId",
  as: "history",
});
models.PoHistory.belongsTo(models.PurchaseOrder, { foreignKey: "poId" });

models.User.hasMany(models.PoHistory, {
  foreignKey: "performedById",
  as: "actions",
});
models.PoHistory.belongsTo(models.User, {
  foreignKey: "performedById",
  as: "performedBy",
});

module.exports = { sequelize, ...models };
