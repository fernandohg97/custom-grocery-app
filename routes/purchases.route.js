const express = require('express')
const purchaseRouter = express.Router()
const purchaseCtrl = require('../controllers/purchases.controller')
const paymentCtrl = require('../controllers/payments.controller')
const { sumPartialPaymentAmounts } = require('../middlewares/purchases/totalAccountsToPayAmount')
const { getCreditAccounts } = require('../middlewares/money-accounts/getCreditAccounts')
const { getPurchasesMaxNoteNumber } = require('../middlewares/getMaxIdNumber')
const { getAllProviderNames } = require('../middlewares/suppliers/getSupplierBasicData')
const validation = require('../middlewares/validators/purchasesValidation')

// Route Views
/* GET all cost and retail price for all products. */
// purchaseRouter.get('/', purchaseCtrl.allHikePurchases) // Purchase checker
purchaseRouter.get('/', purchaseCtrl.getAllPurchases) // todos los proveedores de Proveedores2
purchaseRouter.get('/edit/:id', purchaseCtrl.getPurchaseById, purchaseCtrl.getOnePurchasePayments) // Editar una compra por ID

purchaseRouter.get('/with-payments', purchaseCtrl.getAllPurchasesWithPayments)

purchaseRouter.get('/:note/with-payments', purchaseCtrl.getPurchaseByNoteNumber, purchaseCtrl.getOnePurchasePayments)
purchaseRouter.get('/accounts-to-pay', sumPartialPaymentAmounts, getCreditAccounts, purchaseCtrl.getAllAccountsToPay)

purchaseRouter.get('/add', getPurchasesMaxNoteNumber, getAllProviderNames, (req, res, next) => { // Agregar nuevo proveedor
  return res.render('pages/purchases/add-purchase', {
    newNoteNumber: res.locals.newNoteNumber,
    providerNames: res.locals.providerNames
  })
})

// FILE UPLOAD ROUTE - FOR LATER
purchaseRouter.post('/', validation.validateNewPurchase, purchaseCtrl.newPurchase, paymentCtrl.addPayment) // create new purchase
purchaseRouter.put('/:id', validation.validateUpdatePurchase, purchaseCtrl.updatePurchase) // update one purchase
// TODO:
purchaseRouter.get('/today', purchaseCtrl.getTodayPurchases, paymentCtrl.getTodayPayments)

purchaseRouter.delete('/:id', validation.validateDeletePurchase, purchaseCtrl.removePurchase) // eliminar una compra en estado PENDIENTE DE PAGO

// purchaseRouter.get('/update-product-data', getAllPurchaseProductPageParams, purchaseCtrl.updateProductData)
// purchaseRouter.get('/sheets/update-product-data', purchaseCtrl.updateProducts)

module.exports = purchaseRouter
