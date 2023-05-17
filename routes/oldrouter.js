const express = require("express");

const router = express.Router();
const {  getSelectTextsv1 } = require("../controllers/agriText");
const { getSectionDatav1 } = require("../controllers/agriData");

router.route("/text/selects").get(getSelectTextsv1);
router.route("/data/sections").get(getSectionDatav1);

module.exports = router;
