const express = require('express')
const productRouter = express.Router()
const productCtrl = require('../controllers/products.controller')
const validateProduct = require('../middlewares/validators/productValidation')
const { getAllProductsPageParams } = require('../middlewares/getPageParams')

// Route Views
/* GET all cost and retail price for all products. */
productRouter.get('/', getAllProductsPageParams, productCtrl.allProducts)

// Get product price checker view
productRouter.get('/price', (req, res) => res.render('pages/products/price-checker'))

// Get product price checker view
// productRouter.get('/list-prices', getAllProductsPageParams, productCtrl.allSuppliers)

// Get one product retail price, barcode and name
productRouter.get('/one', productCtrl.oneProductBySku)
// Get all product types
productRouter.get('/types', productCtrl.allProductTypes)
// Get top products of one product type -> /products/types/top/:productTypeId
productRouter.get('/types/top/:typeId', getAllProductsPageParams, productCtrl.topTypeProducts)

// Get products recently created
// productRouter.get('/recents', productCtrl.recentProducts)

// Get product by id
productRouter.get('/:id', productCtrl.oneProduct)
// Update one product
productRouter.post('/:id', validateProduct, productCtrl.updateProduct)

productRouter.delete('/:id', productCtrl.deleteProduct)

module.exports = productRouter
