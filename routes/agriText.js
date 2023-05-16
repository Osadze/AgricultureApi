const express = require("express");

const router = express.Router();
const { getSelectTexts, getTitleTexts } = require("../controllers/agriText");

router.route("/selects").get(getSelectTexts);
router.route("/titles").get(getTitleTexts);

module.exports = router;
