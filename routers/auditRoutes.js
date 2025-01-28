const express = require("express");
const router = express.Router();
const { getAllAudits } = require("../controllers/auditController");

router.get("/", getAllAudits);

module.exports = router;
