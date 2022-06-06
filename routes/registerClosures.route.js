const express = require('express')
const registerClosureRouter = express.Router()
const registerClosureCtrl = require('../controllers/registerClosures.controller')
// const { getAllRegisterClosurePageParams } = require('../middlewares/getPageParams')

registerClosureRouter.get('/', registerClosureCtrl.getAllRegisterClosures)

module.exports = registerClosureRouter
