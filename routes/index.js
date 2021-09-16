'use strict'
const express = require('express')
const router = express.Router()
const axios = require('axios').default
const url = require('url')

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session && req.session.accessToken) return res.redirect('/welcome')
  return res.render('pages/index')
})

router.get('/product', (req, res, next) => {
  return res.render('pages/product')
})

router.get('/welcome', async (req, res, next) => {
  if (!req.session || !req.session.accessToken) return next()
  // const { token } = req.query

  // const url = 'https://api.hikeup.com/api/v1/users/get_all'
  // const options = { headers: { Accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }
  return res.render('pages/welcome', { message: undefined })
})

router.get('/auth', (req, res, next) => {
  if (req.session.accessToken) return res.redirect('/welcome')
  res.redirect(`https://api.hikeup.com/oauth/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=all`)
})

router.get('/logout', (req, res, next) => {
  console.log(req.session.accessToken)
  req.session.destroy(err => {
    if (err) return next(err)
    res.clearCookie('connect.sid', { path: '/', domain: 'localhost' })
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
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: process.env.REDIRECT_URI,
    grant_type: 'authorization_code'
  })
  // const body = JSON.stringify({
  //   client_id: process.env.CLIENT_ID,
  //   client_secret: process.env.CLIENT_SECRET,
  //   code: requestToken
  // })

  const opts = { headers: { accept: 'application/x-www-form-urlencoded' } }

  axios.post(accessTokenUrl, params, opts)
    .then(res => res.data.access_token)
    .then(token => {
      console.log(`Token: ${token}`)
      req.session.accessToken = token
      return res.redirect('/welcome')
    })
    .catch(err => {
      console.log('Inside error')
      console.log(err.message)
      console.log(err.response.data)
      return next(err)
    })
})

module.exports = router
