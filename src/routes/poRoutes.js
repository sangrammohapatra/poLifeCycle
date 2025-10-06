const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { permit } = require("../middleware/roles");
const poCtrl = require("../controllers/poController");

router.use(auth); // all PO routes require auth

router.post("/", permit("creator", "admin"), poCtrl.createPO);
router.put("/:id", permit("creator", "admin"), poCtrl.updatePO);
router.post("/:id/submit", permit("creator", "admin"), poCtrl.submitPO);
router.post("/:id/approve", permit("approver", "admin"), poCtrl.approvePO);
router.post("/:id/reject", permit("approver", "admin"), poCtrl.rejectPO);
router.post("/:id/comment", poCtrl.addComment);

router.get("/", poCtrl.listPOs);
router.get("/:id", poCtrl.getPoDetails);

module.exports = router;
