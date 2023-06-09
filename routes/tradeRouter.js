
const express = require("express");

const router = express.Router();
const {
    getTradeData,getSelectText,getTitleText

} = require("../controllers/trade");

router.route("/data").get(getTradeData);
router.route("/text/select").get(getSelectText);
router.route("/text/title").get(getTitleText);


module.exports = router;
