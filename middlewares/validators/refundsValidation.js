'use strict'
const { check, validationResult } = require('express-validator')
const defaultValues = require('../../config/default-values')
// const moment = require('moment')

const RefundValidation = {
  validateNewRefund: [
    check('noteNumber', 'El número de nota es requerido').trim().notEmpty().isNumeric(), // required
    check('provider', 'El proveedor es requerido').trim().notEmpty(), // required
    check('refundAmount', 'El monto a pagar debe ser mayor a cero y no mayor al monto total de la nota a reembolsar.')
      .isFloat({ min: 0.1 })
      .notEmpty()
      .custom(async (value, { req }) => {
        console.log(value)
        console.log(req.body.totalNoteAmount)
        if (Number(value) > Number(req.body.totalNoteAmount)) {
          throw new Error(`El monto ingresado supera el monto total de la nota: $${req.body.totalNoteAmount}`)
        }
      }), // required

    check('refundDate', 'Asignar la fecha es requerido').notEmpty().isDate().withMessage('Ingresa la fecha en formato: yyyy-mm-dd'), // required
    // check('status', 'El estatus es requerido').notEmpty().isIn(Object.values(defaultValues.defaultPurchaseStatus)),

    // METODO DE PAGO
    check('refundMethod', 'El método de pago reembolsado es requerido.')
      .notEmpty().toUpperCase().isIn(Object.values(defaultValues.defaultPaymentMethods)).withMessage('Selecciona un método de pago correcto.'),

    // USUARIO
    check('user', 'El usuario es requerido').trim().notEmpty().toUpperCase(), // required

    // MOTIVO
    check('reason', 'El motivo es requerido').trim().notEmpty()
      .isIn(Object.values(defaultValues.defaultRefundReasons)).withMessage('Selecciona un motivo correcto.'), // required

    (req, res, next) => {
      console.log('Validating request body')
      const errors = validationResult(req)
      console.log(errors.array())
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

      console.log('ups')
      return next()
    }
  ],
  validateUpdateRefund: [
    check('refundAmount', 'El monto a pagar debe ser mayor a cero y no mayor al monto total de la nota a reembolsar.')
      .isFloat({ min: 0.1 })
      .notEmpty()
      .custom(async (value, { req }) => {
        console.log(value)
        console.log(req.body.totalNoteAmount)
        if (Number(value) > Number(req.body.totalNoteAmount)) {
          throw new Error(`El monto ingresado supera el monto total de la nota: $${req.body.totalNoteAmount}`)
        }
      }), // required

    check('refundDate', 'Asignar la fecha es requerido').notEmpty().isDate().withMessage('Ingresa la fecha en formato: yyyy-mm-dd'), // required
    // check('status', 'El estatus es requerido').notEmpty().isIn(Object.values(defaultValues.defaultPurchaseStatus)),

    // METODO DE PAGO
    check('refundMethod', 'El método de pago reembolsado es requerido.')
      .notEmpty().toUpperCase().isIn(Object.values(defaultValues.defaultPaymentMethods)).withMessage('Selecciona un método de pago correcto.'),

    // MOTIVO
    check('reason', 'El motivo es requerido').trim().notEmpty()
      .isIn(Object.values(defaultValues.defaultRefundReasons)).withMessage('Selecciona un motivo correcto.'), // required
    // required

    (req, res, next) => {
      console.log('Validating request body')
      const errors = validationResult(req)
      console.log(errors.array())
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })

      console.log('ups')
      return next()
    }
  ],
  validateRemoveRefund: [
    // ID
    check('id', 'El ID es requerido').trim().notEmpty(), // required
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

module.exports = RefundValidation
