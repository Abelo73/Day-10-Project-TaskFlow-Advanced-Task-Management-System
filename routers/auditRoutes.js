const express = require("express");
const router = express.Router();
const { getAllAudits } = require("../controllers/auditController");
const authenticateUser = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/roleMiddleware");

router.get(
  "/",
  authenticateUser,
  checkPermission(["GET_AUDITS"]),
  getAllAudits
);

module.exports = router;
