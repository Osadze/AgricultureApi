const express = require('express')


const router = express.Router();
const {getAgricultures , getAgricultureText} = require("../controllers/agriculture")

router.route('/agricultures').get(getAgricultures)
router.route('/agricultures/text').get(getAgricultureText)


module.exports = router;
