const express = require('express')


const router = express.Router();
const {getAgricultures , getAgricultureText, getMainStats} = require("../controllers/agriculture")

router.route('/agricultures').get(getAgricultures)
router.route('/agricultures/text').get(getAgricultureText)
router.route('/agricultures/main').get(getMainStats)



module.exports = router;
