const express = require('express')

const router = express.Router();
const {getSectionData , getMainData} = require("../controllers/agriData")

router.route('/sections').get(getSectionData)
router.route('/main').get(getMainData)



module.exports = router;
