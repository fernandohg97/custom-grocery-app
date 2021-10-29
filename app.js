const createError = require('http-errors')
const express = require('express')
// const expressLayouts = require('express-ejs-layouts')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const session = require('express-session')
const app = express()
const methodOverride = require('method-override')
const configVars = require('./config/config.vars')

require('dotenv').config()

app.use(methodOverride('_method'))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '/public')))
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: true,
  saveUninitialized: false,
  cookie: { secure: false },
  unset: 'destroy'
}))
// app.use(expressLayouts)

// app.set('trust proxy', 1) // trust first proxy
// Set view engine
app.set('view engine', 'ejs')
// app.set('layout', './layouts/layout')
app.set('views', path.join(__dirname, 'views'))

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', '*') // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Methods', 'GET, POST')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept', 'application/json', 'application/x-www-form-urlencoded')
  next()
})

const indexRouter = require('./routes/index')
const productRouter = require('./routes/products.route')
const offerRouter = require('./routes/offers.route')

app.use('/', indexRouter)
app.use('/products', productRouter)
app.use('/offers', offerRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  if (!req.session || !req.session.accessToken) return next(createError(401, 'No se encontró ninguna sesión. Por favor inicia sesión para ingresar.'))
  return next(createError(404, 'No encontramos el recurso que buscas.'))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  // console.log(err)
  // render the error page
  // return res.status(err.status || 500)
  return res.render('pages/error', {
    error: err
  })
})

module.exports = app
