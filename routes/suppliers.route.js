const express = require('express')
const supplierRouter = express.Router()
const supplierCtrl = require('../controllers/suppliers.controller')
// const { getAllSupplierProductPageParams } = require('../middlewares/getPageParams')
const { getProvidersMaxId } = require('../middlewares/getMaxIdNumber')
const validation = require('../middlewares/validators/suppliersValidation')
// const getSupplierPurchasesReport = require('../middlewares/suppliers/supplier-purchases-report')

// Route Views --------------------------------------
/* GET all cost and retail price for all products. */
// supplierRouter.get('/', supplierCtrl.allHikeSuppliers) // Supplier checker
supplierRouter.get('/', supplierCtrl.allSuppliers) // todos los proveedores
supplierRouter.get('/:id', supplierCtrl.getSupplierSummaryById) // Obtener JSON de proveedor por ID

// supplierRouter.get('/purchases', getSupplierPurchasesReport.getAveragePurchaseAmount, getSupplierPurchasesReport.getAccountsToPay, supplierCtrl.allPurchasesByProvider) // OBTENER LAS ULTIMAS 10 COMPRAS POR PROVEEDOR

// supplierRouter.get('/product-list', supplierCtrl.allProductsBySupplier)
// supplierRouter.get('/list', supplierCtrl.suppliersList)

// views
supplierRouter.get('/edit/:id', supplierCtrl.getSupplierById) // Editar por ID
supplierRouter.get('/add', getProvidersMaxId, (req, res, next) => { // Agregar nuevo proveedor
  return res.render('pages/suppliers/add-supplier', {
    newID: res.locals.newID
  })
})

supplierRouter.post('/', validation.validateNewSupplier, getProvidersMaxId, supplierCtrl.newSupplier)
supplierRouter.put('/:id', validation.validateUpdateSupplier, supplierCtrl.updateSupplier) // Actualizar datos de un proveedor
// supplierRouter.delete('/many', supplierCtrl.removeManySuppliers) // Eliminar un proveedor
supplierRouter.delete('/:id', validation.validateDeleteSupplier, supplierCtrl.removeSupplier) // Eliminar un proveedor

// supplierRouter.get('/update-product-data', getAllSupplierProductPageParams, supplierCtrl.updateProductData)
// supplierRouter.get('/sheets/update-product-data', supplierCtrl.updateProducts)

module.exports = supplierRouter
