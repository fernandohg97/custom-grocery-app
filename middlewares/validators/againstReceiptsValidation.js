'use strict'
const { body, check, validationResult } = require('express-validator')
// const Sheet = require('../authSheets')
// const WORKSHEETS = require('../../config/worksheets')
const defaultValues = require('../../config/default-values')
const moment = require('moment')

const AgainstReceiptValidation = {
  validateNewAgainstReceipt: [
    check('providerName', 'Seleccionar un proveedor es requerido').trim().notEmpty().toUpperCase(), // required
    check('numberOfNotes', 'La cantidad de notas es requerido').notEmpty().isNumeric(), // required
    check('totalAmount', 'El monto total debe ser mayor a cero').isFloat({ min: 1 }).notEmpty(), // required
    check('status', 'El estatus es requerido').notEmpty().isIn(Object.values(defaultValues.defaultAgainstReceiptStatus)),

    // METODO DE PAGO
    check('paymentMethod', 'El método de pago es requerido!').notEmpty().toUpperCase().isIn(Object.values(defaultValues.defaultPaymentMethods)).withMessage('Selecciona un método de pago correcto.'),
    // CUENTA DE RETIRO
    check('retirementAccount', 'La cuenta de retiro es requerido.')
      .notEmpty().isIn(Object.values(defaultValues.defaultMoneyAccounts).map(acc => acc.code)).withMessage('Selecciona una cuenta de retiro correcta.'),

    // FECHA A PAGAR
    check('dateToPay', 'La fecha a pagar es requerida')
      .notEmpty().isDate().withMessage('Ingresa la fecha en formato: yyyy-mm-dd') // required
      .custom(async (value, { req }) => {
        console.log(value)
        // const today = moment().format('YYYY-MM-DD')
        const dateToPayValue = moment(value)
        const diffDays = dateToPayValue.diff(moment(), 'days')
        if (diffDays < 7) {
          throw new Error(`Fecha a pagar fuera de rango, la fecha a pagar debe ser 7 dias en adelante a partir de hoy: ${diffDays} día(s)`)
        }
      }),

    // MONTO PARCIAL -- OPCIONA
    check('authorize', 'La autorización es requerido').notEmpty().trim().default('NO'),

    // COMPROBANTE - recibo
    // check('comprobante').optional({ checkFalsy: true }),
    // USUARIO
    check('user', 'El usuario es requerido').trim().notEmpty().toUpperCase(), // required
    check('details').optional({ checkFalsy: true }).trim(),
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

module.exports = AgainstReceiptValidation
