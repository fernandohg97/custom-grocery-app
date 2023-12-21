'use strict'
const { body, check, validationResult } = require('express-validator')
const Sheet = require('../authSheets')
const WORKSHEETS = require('../../config/worksheets')
const defaultValues = require('../../config/default-values')

const SupplierValidation = {
  validateNewSupplier: [
    check('providerName', 'El nombre del proveedor es requerido').trim().notEmpty().toUpperCase() // required
      .custom(async value => {
        await Sheet.loadInfo()

        const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
        const rows = await sheet.getRows()
        const providerToFind = rows.filter(r => {
          return r.toObject().Proveedor === value.toUpperCase()
        })
        // console.log(Boolean(providerToFind[0]))
        if (providerToFind[0]) {
        // Will use the below as the error message
          throw new Error(`Ya existe un proveedor con el nombre: ${value}`)
        }
      }),
    check('seller', 'El nombre del vendedor es requerido').trim().notEmpty(), // required
    check('phone', 'El número de teléfono es requerido').trim().notEmpty()
      .custom(async value => {
        await Sheet.loadInfo()

        const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
        const rows = await sheet.getRows()
        const phoneToFind = rows.filter(r => {
          return r.toObject().Telefono !== ''
        }).filter(r => r.toObject().Telefono === value)
        // console.log(Boolean(providerToFind[0]))
        if (phoneToFind[0]) {
          // Will use the below as the error message
          throw new Error(`Ya existe un proveedor con el mismo telefono: ${value}`)
        }
      }), // required
    check('agreement', 'El convenio es requerido').notEmpty().toUpperCase().isIn(Object.values(defaultValues.defaultProviderAgreements)), // required
    check('category', 'El departamento es requerido').notEmpty().isIn(defaultValues.defaultCategories),
    check('isInvoice', 'Indicar si factura o no es requerido.').notEmpty().toUpperCase(),
    check('paymentMethodProvider', 'El metodo de pago es requerido.').notEmpty().toUpperCase().isIn(Object.values(defaultValues.defaultPaymentMethods)),
    check('retirementAccountProvider', 'La cuenta de retiro es requerido.').notEmpty().toUpperCase().isIn(Object.values(defaultValues.defaultMoneyAccounts).map(acc => acc.name)).withMessage('Selecciona una cuenta de retiro correcta.'),
    check('email', 'El correo es requerido').optional({ checkFalsy: true }).trim().isEmail()
      .custom(async value => {
        await Sheet.loadInfo()

        const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
        const rows = await sheet.getRows()
        const providerToFind = rows.filter(r => {
          return r.toObject().Correo !== ''
        }).filter(r => r.toObject().Correo === value)
        console.log(Boolean(providerToFind[0]))
        if (providerToFind[0]) {
          // Will use the below as the error message
          throw new Error(`El proveedor ${providerToFind[0].toObject().Proveedor} ya existe con este correo.`)
        }
      }),
    check('numberOfNotesAllow')
      .if(body('agreement').notEmpty().default(0).equals('CONSIGNACION'))
      .notEmpty().withMessage('Un mínimo de notas es requerido').isInt({ min: 2, max: 10 }).withMessage('El mínimo son 2 y el máximo son 10 notas'),
    check('daysToPayCredit')
      .if(body('agreement').notEmpty().default(0).equals('CREDITO'))
      .notEmpty().withMessage('Los dias a pagar el crédito es requerido.').isIn([7, 15, 21, 30]).withMessage('Selecciona una de los valores permitidos.'),
    check('bankname')
      .optional({ checkFalsy: true })
      .custom((value, { req }) => {
        if (!value && (req.body.recipient || req.body.clabeAccount)) {
          throw new Error('El banco es requerido.')
        }
        return true
      })
      .toUpperCase(),
    check('recipient').optional({ checkFalsy: true })
      .custom((value, { req }) => {
        if (!value && (req.body.bankname || req.body.clabeAccount)) {
          throw new Error('El beneficiario es requerido.')
        }
        return true
      })
      .toUpperCase(),
    // .custom(async value => {
    //   await Sheet.loadInfo()

    //   const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
    //   const rows = await sheet.getRows()
    //   const providerToFind = rows.filter(r => {
    //     return r.toObject().Beneficiario === value
    //   })
    //   console.log(Boolean(providerToFind[0]))
    //   if (providerToFind[0]) {
    //     // Will use the below as the error message
    //     throw new Error(`El proveedor ${providerToFind[0].toObject().Proveedor} ya existe con este beneficiario.`)
    //   }
    // }),
    check('clabeAccount').optional({ checkFalsy: true })
      .custom((value, { req }) => {
        if (!value && (req.body.bankname || req.body.recipient)) {
          throw new Error('La cuenta CLABE es requerido.')
        }
        return true
      })
      .toUpperCase(),
    // .custom(async value => {
    //   await Sheet.loadInfo()

    //   const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
    //   const rows = await sheet.getRows()
    //   const providerToFind = rows.filter(r => {
    //     return r.toObject().CLABE === value
    //   })
    //   console.log(Boolean(providerToFind[0]))
    //   if (providerToFind[0]) {
    //     // Will use the below as the error message
    //     throw new Error(`El proveedor ${providerToFind[0].toObject().Proveedor} ya existe con esta CLABE.`)
    //   }
    // }),
    check('cardnumber').optional({ checkFalsy: true }).isCreditCard(),
    // .custom(async value => {
    //   await Sheet.loadInfo()

    //   const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
    //   const rows = await sheet.getRows()
    //   const providerToFind = rows.filter(r => {
    //     return r.toObject()['No Tarjeta'] === value
    //   })
    //   console.log(Boolean(providerToFind[0]))
    //   if (providerToFind[0]) {
    //     // Will use the below as the error message
    //     throw new Error(`El proveedor ${providerToFind[0].toObject().Proveedor} ya existe con este número de tarjeta.`)
    //   }
    // }),
    (req, res, next) => {
      console.log('Validating request body')
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })
      console.log('ups')
      return next()
    }
  ],
  validateUpdateSupplier: [
    [
      check('providerName').trim().notEmpty().toUpperCase(),
      check('seller', 'El nombre del vendedor es requerido').trim().notEmpty(),
      check('phone', 'El número de teléfono es requerido').trim().notEmpty(),
      check('email', 'El correo es requerido').optional({ checkFalsy: true }).trim().isEmail(),
      check('agreement', 'El convenio es requerido').notEmpty().toUpperCase().isIn(Object.values(defaultValues.defaultProviderAgreements)),
      check('category', 'El departamento es requerido').notEmpty().isIn(defaultValues.defaultCategories),
      check('isInvoice', 'Indicar si factura o no es requerido.').notEmpty().default('FACTURA').toUpperCase(),
      check('paymentMethodProvider', 'El metodo de pago es requerido.').notEmpty().toUpperCase().isIn(Object.values(defaultValues.defaultPaymentMethods)),
      check('retirementAccountProvider', 'La cuenta de retiro es requerido.').notEmpty().toUpperCase().isIn(Object.values(defaultValues.defaultMoneyAccounts).map(acc => acc.name)).withMessage('Selecciona una cuenta de retiro correcta.'),
      check('numberOfNotesAllow')
        .if(body('agreement').notEmpty().default(0).equals('CONSIGNACION'))
        .notEmpty().withMessage('Un mínimo de notas es requerido').isInt({ min: 2, max: 10 }).withMessage('El mínimo son 2 y el máximo son 10 notas'),
      check('daysToPayCredit')
        .if(body('agreement').notEmpty().default(0).equals('CREDITO'))
        .notEmpty().withMessage('Los dias a pagar el credito es requerido.').isIn([7, 15, 21, 30]).withMessage('Selecciona una de los valores permitidos.'),
      check('bankname')
        .custom((value, { req }) => {
          if (!value && (req.body.recipient || req.body.clabeAccount)) {
            throw new Error('El banco es requerido.')
          }
          return true
        })
        .toUpperCase(),
      // .notEmpty().withMessage('El nombre del banco es requerido.').toUpperCase(),
      check('recipient')
        .custom((value, { req }) => {
          if (!value && (req.body.bankname || req.body.clabeAccount)) {
            throw new Error('El beneficiario es requerido.')
          }
          return true
        })
        .toUpperCase(),
      check('clabeAccount')
        .custom((value, { req }) => {
          if (!value && (req.body.bankname || req.body.recipient)) {
            throw new Error('La cuenta CLABE es requerido.')
          }
          return true
        })
        .toUpperCase(),
      check('cardnumber')
        .optional({ checkFalsy: true })
        .isCreditCard()
        .toUpperCase(),
      (req, res, next) => {
        console.log('Validating request body')
        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })
        console.log('ups')
        return next()
      }
    ]
  ],
  validateDeleteSupplier: [
    check('passwordConfirm')
      .custom(value => {
        console.log(value)
        if (value !== defaultValues.defaultConfirmationPassword.deletePassword) {
          throw new Error('La contraseña es incorrecta')
        }
        return true
      }),
    // .trim().notEmpty(),
    (req, res, next) => {
      console.log('Validating request body')
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })
      console.log('ups')
      return next()
    }
  ]
}

module.exports = SupplierValidation
