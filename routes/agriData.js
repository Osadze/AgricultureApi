const express = require("express");

const router = express.Router();
const {
  getSectionData,
  getMainData,
  getFoodBalance,
} = require("../controllers/agriData");

router.route("/sections").get(getSectionData);
router.route("/main").get(getMainData);
router.route("/balance").get(getFoodBalance);

module.exports = router;
