const express = require('express')
const salesRouter = express.Router()
const salesCtrl = require('../controllers/sales.controller')
const getPageParams = require('../middlewares/getPageParams')

// Route Views
/* GET all cost and retail price for all products. */
salesRouter.get('/', getPageParams, salesCtrl.allSales)

module.exports = salesRouter
