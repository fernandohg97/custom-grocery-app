'use strict'
const { body, check, validationResult } = require('express-validator')
const Sheet = require('../authSheets')
const WORKSHEETS = require('../../config/worksheets')
const defaultValues = require('../../config/default-values')
const moment = require('moment')

const PaymentValidation = {
  validateNewPayment: [
    check('noteNumber', 'El número de nota es requerido').trim().notEmpty().isNumeric(), // required
    // check('folio', 'El folio es requerido').trim().notEmpty(), // required
    check('paymentAmount', 'El monto a pagar debe ser mayor a cero y menor al saldo restante.')
      .isFloat({ min: 0.1 })
      .notEmpty()
      .custom(async (value, { req }) => {
        console.log(value)
        console.log(req.body.saldo)
        if (Number(value) > Number(req.body.saldo)) {
          throw new Error(`El monto ingresado supera el saldo restante: $${req.body.saldo}`)
        }
      }), // required

    check('paymentDate', 'Asignar la fecha de pago es requerido').notEmpty().isDate().withMessage('Ingresa la fecha en formato: yyyy-mm-dd'), // required
    // check('status', 'El estatus es requerido').notEmpty().isIn(Object.values(defaultValues.defaultPurchaseStatus)),

    // METODO DE PAGO
    check('paymentMethod', 'El método de pago es requerido!')
      .notEmpty().toUpperCase().isIn(Object.values(defaultValues.defaultPaymentMethods)).withMessage('Selecciona un método de pago correcto.'),

    // CUENTA DE RETIRO
    check('retirementAccount', 'La cuenta de retiro es requerido.')
      .notEmpty().isIn(Object.values(defaultValues.defaultMoneyAccounts).map(acc => acc.code)).withMessage('Selecciona una cuenta de retiro correcta.'),

    // check('retirementAccount', 'La cuenta de retiro es requerido.')
    //   .if(body('paymentMethod').equals('EFECTIVO'))
    //   .notEmpty().isIn(Object.values(defaultValues.defaultMoneyAccounts).map(acc => acc.code)).withMessage('Selecciona una cuenta de retiro correcta.'),

    // COMPROBANTE - recibo
    // check('comprobante').optional({ checkFalsy: true }),
    // USUARIO
    check('user', 'El usuario es requerido').trim().notEmpty().toUpperCase(), // required
    // Indicar si es pago masivo
    check('isMassivePayment', 'Indicar si es pago masivo o no es requerido').default(false).isBoolean({ loose: true }).toBoolean().notEmpty(), // required
    (req, res, next) => {
      console.log('Validating request body')
      const errors = validationResult(req)
      console.log(errors.array())
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

      console.log('ups')
      return next()
    }
  ],
  validateNewMassivePayment: [ // TODO: in progress
    check('resume').customSanitizer((value, { req }) => {
      // parse JSON string
      console.log(JSON.parse(value))
      return JSON.parse(value)
    }),
    check('accountsToPay', 'No es un arreglo').customSanitizer((value, { req }) => {
      // parse JSON string
      console.log(JSON.parse(value))
      return JSON.parse(value)
    }),
    check('payments.*.No Nota', 'El número de nota es requerido').trim().notEmpty().isNumeric(), // required
    // check('payments.*.Detalles', 'Detalles esta vacio').trim().notEmpty(), // required

    // METODO DE PAGO
    check('paymentMethod', 'El método de pago es requerido!')
      .notEmpty().toUpperCase().isIn([defaultValues.defaultPaymentMethods.EFECTIVO, defaultValues.defaultPaymentMethods.TRANSFERENCIA_ELECTRONICA]).withMessage('Selecciona un método de pago correcto.'),

    // check('retirementAccount', 'La cuenta de retiro es requerido.')
    //   .if(body('paymentMethod').equals('EFECTIVO'))
    //   .notEmpty().isIn(Object.values(defaultValues.defaultMoneyAccounts).map(acc => acc.code)).withMessage('Selecciona una cuenta de retiro correcta.'),
    // FECHA DE PAGO
    // check('paymentDate').default(moment().format('DD MMM. YYYY')),
    // USUARIO
    check('user', 'El usuario es requerido').trim().notEmpty().toUpperCase(), // required
    // Indicar si es pago masivo
    check('isMassivePayment', 'Indicar si es pago masivo o no es requerido').default(false).isBoolean({ loose: true }).toBoolean().notEmpty(), // required
    (req, res, next) => {
      console.log('Validating request body')
      const errors = validationResult(req)
      console.log(errors.array())
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

      console.log('ups')
      return next()
    }
  ],
  validateNewReceiptPayment: [
    check('folioRecibo', 'El folio del contrarecibo es requerido').trim().notEmpty().isAlphanumeric(), // required
    // check('folio', 'El folio es requerido').trim().notEmpty(), // required
    check('paymentAmount', 'El monto a pagar debe ser mayor a cero y menor al saldo restante.')
      .isFloat({ min: 0.1 })
      .notEmpty()
      .custom(async (value, { req }) => {
        console.log(value)
        console.log(req.body.saldoTotal)
        if (Number(value) !== Number(req.body.saldoTotal)) {
          throw new Error(`El monto ingresado debe ser igual al monto total del contrarecibo: $${req.body.saldoTotal}`)
        }
      }), // required

    check('paymentDate', 'Asignar la fecha de pago es requerido').notEmpty().isDate().withMessage('Ingresa la fecha en formato: yyyy-mm-dd'), // required
    // check('status', 'El estatus es requerido').notEmpty().isIn(Object.values(defaultValues.defaultPurchaseStatus)),

    // METODO DE PAGO
    check('paymentMethod', 'El método de pago es requerido!')
      .notEmpty().toUpperCase().isIn(Object.values(defaultValues.defaultPaymentMethods)).withMessage('Selecciona un método de pago correcto.'),

    // CUENTA DE RETIRO
    check('retirementAccount', 'La cuenta de retiro es requerido.')
      .notEmpty().isIn(Object.values(defaultValues.defaultMoneyAccounts).map(acc => acc.code)).withMessage('Selecciona una cuenta de retiro correcta.'),

    // check('retirementAccount', 'La cuenta de retiro es requerido.')
    //   .if(body('paymentMethod').equals('EFECTIVO'))
    //   .notEmpty().isIn(Object.values(defaultValues.defaultMoneyAccounts).map(acc => acc.code)).withMessage('Selecciona una cuenta de retiro correcta.'),

    // COMPROBANTE - recibo
    // check('comprobante').optional({ checkFalsy: true }),
    // USUARIO
    check('user', 'El usuario es requerido').trim().notEmpty().toUpperCase(), // required
    // Indicar si es pago masivo o pago de contrarecibo
    check('isMassivePayment', 'Indicar si es pago masivo o no es requerido').default(false).isBoolean({ loose: true }).toBoolean().notEmpty(), // required
    check('isAgainstReceiptPayment', 'Indicar si es pago de contrarecibo').default(true).isBoolean({ loose: true }).toBoolean().notEmpty(), // required
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

module.exports = PaymentValidation
