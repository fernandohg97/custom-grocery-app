'use strict'

module.exports = {
  getTotalNetAmount: (salesRange) => salesRange.map(sale => sale.netAmount).reduce((a, b) => a + b, 0),
  getTotalRegisterSales: (registers) => registers.map(register => register.total_sales).reduce((a, b) => a + b, 0)
}
