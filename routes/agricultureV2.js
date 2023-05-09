const express = require('express')


const router = express.Router();
const {getAgricultures , getAgricultureText, getAgriculturesV2} = require("../controllers/agriculture")

router.route('/agricultures').get(getAgriculturesV2)
router.route('/agricultures/text').get(getAgricultureText)


module.exports = router;
