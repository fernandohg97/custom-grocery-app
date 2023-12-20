'use strict'
const { body, check, validationResult } = require('express-validator')
const Sheet = require('../authSheets')
const WORKSHEETS = require('../../config/worksheets')
const defaultValues = require('../../config/default-values')
const moment = require('moment')

const PurchaseValidation = {
  validateNewPurchase: [
    check('noteNumber', 'El número de nota es requerido').trim().notEmpty().isNumeric().withMessage('El número de nota debe ser numerico'), // required
    check('providerName', 'Seleccionar un proveedor es requerido').trim().notEmpty().toUpperCase(), // required
    check('type', 'Seleccionar el tipo de compra es requerido').notEmpty().isIn(Object.values(defaultValues.defaultPurchaseTypes)), // required
    check('dateRecord', 'Asignar la fecha de visita es requerido').notEmpty().isDate().withMessage('Ingresa la fecha en formato: yyyy-mm-dd'), // required
    check('totalAmount', 'El monto total debe ser mayor a cero').isFloat({ min: 1 }).notEmpty(), // required
    check('status', 'El estatus es requerido').notEmpty().isIn(Object.values(defaultValues.defaultPurchaseStatus)),

    // METODO DE PAGO
    check('paymentMethod', 'El método de pago es requerido!')
      .if(body('status').equals('LIQUIDADO'))
      .notEmpty().toUpperCase().isIn(Object.values(defaultValues.defaultPaymentMethods)).withMessage('Selecciona un método de pago correcto.'),
    check('paymentMethod', 'El método de pago es requerido!')
      .if(body('status').equals('PAGO PARCIAL'))
      .notEmpty().toUpperCase().isIn(Object.values(defaultValues.defaultPaymentMethods)).withMessage('Selecciona un método de pago correcto.'),

    // CUENTA DE RETIRO
    check('retirementAccount', 'La cuenta de retiro es requerido.')
      .if(body('status').equals('LIQUIDADO'))
      .notEmpty().isIn(Object.values(defaultValues.defaultMoneyAccounts).map(acc => acc.code)).withMessage('Selecciona una cuenta de retiro correcta.'),
    check('retirementAccount', 'La cuenta de retiro es requerido.')
      .if(body('status').equals('PAGO PARCIAL'))
      .notEmpty().isIn(Object.values(defaultValues.defaultMoneyAccounts).map(acc => acc.code)).withMessage('Selecciona una cuenta de retiro correcta.'),

    // FECHA A PAGAR
    check('dateToPayRecord', 'La fecha a pagar es requerida')
      .if(body('status').notEmpty().equals('PENDIENTE DE PAGO'))
      .notEmpty().isDate().withMessage('Ingresa la fecha en formato: yyyy-mm-dd'), // required

    check('dateToPayRecord', 'La fecha a pagar es requerida')
      .if(body('status').notEmpty().equals('PAGO PARCIAL'))
      .notEmpty().isDate().withMessage('Ingresa la fecha en formato: yyyy-mm-dd'), // required

    // MONTO PARCIAL -- OPCIONA
    check('partialAmount', 'El pago parcial es requerido')
      .if(body('status').notEmpty().equals('PAGO PARCIAL'))
      .notEmpty().isFloat({ min: 1 }).withMessage('El pago parcial debe ser igual o mayor a 1.')
      .custom(async (value, { req }) => {
        console.log(value)
        console.log(req.body.totalAmount)
        if (Number(value) >= Number(req.body.totalAmount)) {
          throw new Error(`El pago parcial debe ser menor al monto total: $${req.body.totalAmount}`)
        }
      }),

    // COMPROBANTE - recibo
    // check('comprobante').optional({ checkFalsy: true }),
    // USUARIO
    check('user', 'El usuario es requerido').trim().notEmpty().toUpperCase(), // required
    check('purchaseDetails').optional({ checkFalsy: true }).trim(),
    (req, res, next) => {
      console.log('Validating request body')
      const errors = validationResult(req)
      console.log(errors.array())
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

      console.log('ups')
      return next()
    }
  ],
  validateUpdatePurchase: [
    check('type', 'Seleccionar el tipo de compra es requerido').notEmpty().isIn(Object.values(defaultValues.defaultPurchaseTypes)), // required
    check('dateRecord', 'Asignar la fecha de visita es requerido').notEmpty().isDate().withMessage('Ingresa la fecha en formato: yyyy-mm-dd'), // required

    check('totalPayed').optional({ checkFalsy: true }),

    // MONTO TOTAL - COMPARAR QUE SEA MAYOR AL MONTO TOTAL ABONADO
    check('totalAmount', 'El monto total debe ser mayor a cero').notEmpty().isFloat({ min: 1 }) // required
      .custom((value, { req }) => {
        if (Number(value) <= Number(req.body.totalPayed)) {
          throw new Error(`El monto total debe ser mayor al total abonado: ${req.body.totalPayed}`)
        }
        return true
      }),

    // FECHA A PAGAR // required
    check('dateToPayRecord', 'La fecha a pagar es requerida').notEmpty().isDate().withMessage('Ingresa la fecha en formato: yyyy-mm-dd')
      .custom((value, { req }) => {
        if (value <= req.body.dateRecord) {
          throw new Error(`La fecha a pagar debe ser mayor a la fecha de recibido: ${req.body.dateRecord}`)
        } else if (moment().format('YYYY-MM-DD') > moment(value).format('YYYY-MM-DD')) {
          throw new Error(`La fecha a pagar debe ser igual o mayor a la fecha de hoy: ${new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date())}`)
        }
        return true
      }),

    check('purchaseDetails').optional({ checkFalsy: true }).trim(),
    (req, res, next) => {
      console.log('Validating request body')
      const errors = validationResult(req)
      console.log(errors.array())
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

      console.log('ups')
      return next()
    }
  ]
}

module.exports = PurchaseValidation
