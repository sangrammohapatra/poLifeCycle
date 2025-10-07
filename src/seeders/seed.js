require("dotenv").config();
const { sequelize, User, PurchaseOrder } = require("../models");

async function addColumnsIfNotExist() {
  // SQLite doesn't support IF NOT EXISTS in ALTER TABLE, so we check the columns manually
  const tableInfo = await sequelize.query(
    `PRAGMA table_info(purchase_orders);`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const columns = tableInfo.map((col) => col.name);

  if (!columns.includes("vendor")) {
    await sequelize.query(
      `ALTER TABLE purchase_orders ADD COLUMN vendor TEXT NOT NULL DEFAULT 'Unknown Vendor';`
    );
    console.log("Added column 'vendor' to purchase_orders");
  }

  if (!columns.includes("description")) {
    await sequelize.query(
      `ALTER TABLE purchase_orders ADD COLUMN description TEXT NOT NULL DEFAULT 'No description';`
    );
    console.log("Added column 'description' to purchase_orders");
  }
}

async function seed() {
  try {
    // Sync models (does not remove data)
    await sequelize.sync();
    // Ensure purchase_orders has the new columns
    await addColumnsIfNotExist();

    // Seed Users
    const existing = await User.findOne({
      where: { email: "persona1@example.com" },
    });
    if (!existing) {
      await User.create({
        name: "Persona One",
        email: "persona1@example.com",
        password: "password123",
        role: "creator",
      });
      console.log(
        "Persona1 (creator) created: persona1@example.com / password123"
      );
    }
    const existing2 = await User.findOne({
      where: { email: "persona2@example.com" },
    });
    if (!existing2) {
      await User.create({
        name: "Persona Two",
        email: "persona2@example.com",
        password: "password123",
        role: "approver",
      });
      console.log(
        "Persona2 (approver) created: persona2@example.com / password123"
      );
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
