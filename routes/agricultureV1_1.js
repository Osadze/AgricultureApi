const express = require('express')


const router = express.Router();
const {getAgricultures , getAgricultureText, agricultureV1_1} = require("../controllers/agriculture")

router.route('/agricultures').get(agricultureV1_1)
router.route('/agricultures/text').get(getAgricultureText)


module.exports = router;
