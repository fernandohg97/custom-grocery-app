'use strict'
const axios = require('axios').default
const createError = require('http-errors')

class RegisterClosure {
  static getAllUrl = 'https://api.hikeup.com/api/v1/registerClosures/get_all'
  static pageSize = 50
  static skipCount = 0
  static async getAllRegisterClosures (req, res, next) {
    const { startDate, endDate } = req.query

    // Options for this request
    const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }

    // const searchFilter = 'CS0'
    try {
      // Call API to get all products
      const data = await axios.get(`${RegisterClosure.getAllUrl}?page_size=${RegisterClosure.pageSize}&Skip_count=${RegisterClosure.skipCount}&closure_range_from=${startDate}&closure_range_to=${endDate}`, opts)

      const registers = data.data
      const totalCount = registers.totalCount
      return res.send(registers)
      // console.log(totalCount, numberOfPages, registers.items.length)
      // return res.render('pages/registers/registers', {
      //   registers: registers.items,
      //   totalCount
      // })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }
}

module.exports = RegisterClosure
