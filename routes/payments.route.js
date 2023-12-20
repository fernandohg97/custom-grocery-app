const express = require('express')
const paymentRouter = express.Router()
const paymentCtrl = require('../controllers/payments.controller')
const purchaseCtrl = require('../controllers/purchases.controller')

const validation = require('../middlewares/validators/paymentsValidation')

// const { getAllPurchaseProductPageParams } = require('../middlewares/getPageParams')
// const getProvidersMaxIdNumber = require('../middlewares/payments/getMaxIdNumber')
// const validateNewPurchase = require('../middlewares/validators/paymentsValidation')

// Route Views
/* GET all cost and retail price for all products. */
// paymentRouter.get('/', paymentCtrl.allHikePurchases) // Purchase checker

// TODO:
paymentRouter.get('/', paymentCtrl.getAllPayments) // obtener todos los pagos de los ultimos 6 meses
paymentRouter.get('/today', paymentCtrl.getTodayPayments)
paymentRouter.get('/add-payment/:note', purchaseCtrl.getPurchaseByNoteNumber, purchaseCtrl.getOnePurchasePayments)
// OBTENER NOTAS LIQUIDADAS CON UN PAGO REGULAR - sin masivo ni contrarecibo
paymentRouter.get('/:folio', paymentCtrl.getAllPaymentNotesByFolio)
// OBTENER NOTAS LIQUIDADAS CON UN PAGO MASIVO
paymentRouter.get('/massive/:folio', paymentCtrl.getAllMassivePaymentNotes)
// OBTENER NOTAS LIQUIDADAS CON UN PAGO CONTRARECIBO
paymentRouter.get('/against-receipt/:folio', paymentCtrl.getAllAgainstReceiptPaymentNotes)

paymentRouter.post('/', validation.validateNewPayment, paymentCtrl.addAbono)
paymentRouter.post('/add-massive-payment', validation.validateNewMassivePayment, paymentCtrl.newMassivePayment) // TODO: in progress
// paymentRouter.post('/', validateNewPurchase, getProvidersMaxIdNumber, paymentCtrl.newPurchase)

// paymentRouter.get('/update-product-data', getAllPurchaseProductPageParams, paymentCtrl.updateProductData)
// paymentRouter.get('/sheets/update-product-data', paymentCtrl.updateProducts)

module.exports = paymentRouter
