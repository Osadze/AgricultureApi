const express = require("express");

const router = express.Router();
const { getSectionDataV1_1 } = require("../controllers/agriData");

router.route("/sections").get(getSectionDataV1_1);

module.exports = router;
