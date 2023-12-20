'use strict'
const express = require('express')
const router = express.Router()
const axios = require('axios').default
const url = require('url')
const configVars = require('../config/config.vars')
const getTotalCountElements = require('../middlewares/totalCount')

/* GET home page. */
router.get('/admin', [
  getTotalCountElements.totalNumberOfSuppliers,
  getTotalCountElements.totalNumberOfPurchases,
  getTotalCountElements.totalNumberOfPayments
], async (req, res, next) => {
  // if (req.session && req.session.accessToken) return res.redirect('/welcome')
  console.log(req.session)

  // if (!req.session || !req.session.accessToken) return res.redirect('/auth')
  console.log(req.session)
  return res.render('pages/index', {
    suppliersCount: res.locals.totalCountSuppliers,
    purchasesCount: res.locals.totalCountPurchases,
    paymentsCount: res.locals.totalCountPayments
  })
})

// GET LOGIN PAGE
router.get('/', async (req, res, next) => {
  return res.render('pages/users/login', { layout: './layouts/full-login' })
})

// router.get('/welcome', async (req, res, next) => {
//   if (!req.session || !req.session.accessToken) return next()
//   // const { token } = req.query

//   // const url = 'https://api.hikeup.com/api/v1/users/get_all'
//   // const options = { headers: { Accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }
//   return res.render('pages/welcome', { successMessage: '' })
// })

router.get('/auth', (req, res, next) => {
  if (req.session.accessToken) return res.redirect('/')
  res.redirect(`https://api.hikeup.com/oauth/authorize?response_type=code&client_id=${configVars.client_id}&redirect_uri=${configVars.redirect_uri}&scope=all`)
})

router.get('/logout', (req, res, next) => {
  console.log(req.session.accessToken)
  req.session.destroy(err => {
    if (err) return next(err)
    res.clearCookie('auth')
    // res.clearCookie('connect.sid', { path: '/', domain: 'localhost' })
    // req.session = null
    return res.redirect('/')
  })
})

router.get('/callback', (req, res, next) => {
  // The req.query object has the query params that
  // were sent to this route. We want the `code` param
  const requestToken = req.query.code
  const accessTokenUrl = 'https://api.hikeup.com/oauth/token'

  const params = new url.URLSearchParams({
    code: requestToken,
    client_id: configVars.client_id,
    client_secret: configVars.client_secret,
    redirect_uri: configVars.redirect_uri,
    grant_type: 'authorization_code'
  })

  const opts = { headers: { accept: 'application/x-www-form-urlencoded' } }

  axios.post(accessTokenUrl, params, opts)
    .then(res => res.data.access_token)
    .then(token => {
      console.log(`Token: ${token}`)
      req.session.accessToken = token
      res.cookie('auth', token, { expires: new Date(Date.now() + 8 * 3600000), httpOnly: true })
      return res.redirect('/')
    })
    .catch(err => {
      console.log('Inside error')
      console.log(err.message)
      console.log(err.response.data)
      return next(err)
    })
})

// router.get('/product', (req, res, next) => {
//   return res.render('pages/product')
// })

module.exports = router
