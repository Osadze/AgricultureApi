
const express = require("express");

const router = express.Router();
const {
    getTradeData,getTradeText

} = require("../controllers/trade");

router.route("/data").get(getTradeData);
router.route("/text").get(getTradeText);


module.exports = router;
