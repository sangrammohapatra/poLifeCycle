require("dotenv").config();
const { sequelize, User } = require("../models");

async function seed() {
  try {
    await sequelize.sync({ alter: true });

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
