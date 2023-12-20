const express = require('express')
const refundRouter = express.Router()
const refundCtrl = require('../controllers/refunds.controller')
// const { sumPartialPaymentAmounts } = require('../middlewares/refunds/totalAccountsToPayAmount')
// const { getCreditAccounts } = require('../middlewares/money-accounts/getCreditAccounts')
// const { getAllProviderNames } = require('../middlewares/suppliers/getSupplierBasicData')
const validation = require('../middlewares/validators/refundsValidation')

// Route Views
/* GET all cost and retail price for all products. */
// refundRouter.get('/', refundCtrl.allHikeRefunds) // Refund checker
refundRouter.get('/', refundCtrl.getAllRefunds) // VISTA - todos los reembolsos de Proveedores3
refundRouter.get('/add', refundCtrl.getNoteToRefund) // VISTA - Mostrar vista para agregar un reembolso
refundRouter.get('/edit/:id', refundCtrl.getRefundById) // VISTA - Editar un reembolso por ID
// refundRouter.get('/notes/:noteNumber', refundCtrl.getRefundedNotes) // VISTA - Obtener las notas que pertenecen a la devolucion

// FILE UPLOAD ROUTE - FOR LATER
refundRouter.post('/', validation.validateNewRefund, refundCtrl.newRefund) // create new refund
refundRouter.put('/:id', validation.validateUpdateRefund, refundCtrl.updateRefund) // update one refund
// TODO:
refundRouter.delete('/:id', validation.validateRemoveRefund, refundCtrl.removeRefund) // remove one refund

module.exports = refundRouter
