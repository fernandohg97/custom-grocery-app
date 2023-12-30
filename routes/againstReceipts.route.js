const express = require('express')
const againstReceiptRouter = express.Router()
const againstReceiptCtrl = require('../controllers/againstReceipts.controller')
// const purchaseCtrl = require('../controllers/purchases.controller')
const validationAgainstReceipt = require('../middlewares/validators/againstReceiptsValidation')
const validationPayment = require('../middlewares/validators/paymentsValidation')

// const { getAllPurchaseProductPageParams } = require('../middlewares/getPageParams')
// const getProvidersMaxIdNumber = require('../middlewares/againstreceipts/getMaxIdNumber')
// const validateNewPurchase = require('../middlewares/validators/againstreceiptsValidation')

// Route Views
/* GET all cost and retail price for all products. */
// againstreceiptRouter.get('/', againstreceiptCtrl.allHikePurchases) // Purchase checker

// TODO: in progress endpoints
againstReceiptRouter.get('/', againstReceiptCtrl.getAllAgainstReceipts) // todos los contrarecibos
againstReceiptRouter.get('/:folio', againstReceiptCtrl.getOneAgainstReceiptNotes) // ver 1 contrarecibo por Folio
againstReceiptRouter.get('/invoice/:folio', againstReceiptCtrl.showPDFAgainstReceipt) // Ver contrarecibo archivo PDF por Folio
againstReceiptRouter.get('/add-payment/:folio', againstReceiptCtrl.getAgainstReceiptToPay) // Obtener contrarecibo por folio para pagar

// POST endpoints
againstReceiptRouter.post('/', validationAgainstReceipt.validateNewAgainstReceipt, againstReceiptCtrl.newAgainstReceipt) // crear contrarecibo
againstReceiptRouter.post('/add-receipt-payment', validationPayment.validateNewReceiptPayment, againstReceiptCtrl.payOneAgainstReceipt) // pagar un contrarecibo

// againstReceiptRouter.get('/invoice/download', async (req, res, next) => {
//   res.download(`invoices/${res.locals.filename}`, res.locals.filename)
// }) // Ver contrarecibo archivo PDF por Folio

// againstReceiptRouter.put('/:folio', validation.validateUpdateAgainstReceipt, againstReceiptCtrl.updateAgainstReceipt) // editar 1 contrarecibo por folio

module.exports = againstReceiptRouter
