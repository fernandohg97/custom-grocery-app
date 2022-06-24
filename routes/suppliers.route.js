const express = require('express')
const supplierRouter = express.Router()
const supplierCtrl = require('../controllers/suppliers.controller')
const { getAllSupplierProductPageParams } = require('../middlewares/getPageParams')

// Route Views
/* GET all cost and retail price for all products. */
supplierRouter.get('/', supplierCtrl.allSuppliers) // Supplier checker
supplierRouter.get('/product-list', supplierCtrl.allProductsBySupplier)
supplierRouter.get('/list', supplierCtrl.suppliersList)
// supplierRouter.get('/update-product-data', getAllSupplierProductPageParams, supplierCtrl.updateProductData)
// supplierRouter.get('/sheets/update-product-data', supplierCtrl.updateProducts)

module.exports = supplierRouter
