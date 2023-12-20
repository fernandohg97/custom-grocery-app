'use strict'
const express = require('express')
const moneyAccountRouter = express.Router()
const moneyAccountCtrl = require('../controllers/moneyAccounts.controller')
const { sumPartialPaymentAmounts } = require('../middlewares/purchases/totalAccountsToPayAmount')
// const { getAllPurchaseProductPageParams } = require('../middlewares/getPageParams')
// const getProvidersMaxIdNumber = require('../middlewares/purchases/getMaxIdNumber')
// const validateNewPurchase = require('../middlewares/validators/purchasesValidation')

// Route Views
/* GET all cost and retail price for all products. */
// purchaseRouter.get('/', purchaseCtrl.allHikePurchases) // Purchase checker
moneyAccountRouter.get('/', moneyAccountCtrl.getAllMoneyAccounts) // todos las cuentas de dinero
moneyAccountRouter.get('/one', moneyAccountCtrl.getTransactionsByCode) // todos las cuentas de dinero
moneyAccountRouter.get('/purchases', moneyAccountCtrl.getPurchasesByCode) // todos las cuentas de dinero

// moneyAccountRouter.get('/with-payments', moneyAccountCtrl.getAllPurchasesWithPayments)
// moneyAccountRouter.get('/:note/with-payments', moneyAccountCtrl.getOnePurchaseWithPayment)
// moneyAccountRouter.get('/accounts-to-pay', sumPartialPaymentAmounts, moneyAccountCtrl.getAllAccountsToPay)

module.exports = moneyAccountRouter
