const express = require("express");
const router = express.Router();
const {
  createRole,
  getAllRoles,
  deleteRoles,
  updateRoles,
  getRoleById,
} = require("../controllers/AccessController");
const checkRole = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", createRole);
router.get("/", getAllRoles);
router.get("/:id", getRoleById);
router.delete("/:id", deleteRoles);
router.put("/:id", updateRoles);

module.exports = router;
