const { check, validationResult } = require('express-validator')

const validateProduct = [
  check('product_outlets.*.outlet_id').toFloat(),
  check('product_outlets.*.cost_price').toFloat(),
  check('product_outlets.*.markup').toFloat(),
  check('product_outlets.*.price_ex_tax').toFloat(),
  check('product_outlets.*.tax_id').toFloat(),
  check('product_outlets.*.tax_rate').toFloat(),
  check('product_outlets.*.price_inc_tax').toFloat(),
  check('product_outlets.*.on_hand_inventory').toFloat(),
  check('product_outlets.*.inventory_to_receive').toFloat(),
  check('product_outlets.*.reserved_inventory').toFloat(),
  check('product_outlets.*.available_inventory').toFloat(),
  check('product_outlets.*.reorder_level').toFloat(),
  check('product_outlets.*.reorder_qty').toFloat(),
  check('product_outlets.*.visible_or_not').toBoolean(),
  (req, res, next) => {
    console.log('Validating request body')
    const errors = validationResult(req)
    if (!errors.isEmpty()) return next({ status: 422, errors: errors.array() })
    next()
  }
]

module.exports = validateProduct
