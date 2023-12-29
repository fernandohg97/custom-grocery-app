
const createError = require('http-errors')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const session = require('express-session')
const app = express()
const methodOverride = require('method-override')
const favicon = require('serve-favicon')
const cors = require('cors')
const multer = require('multer')

const { secretKey } = require('./config/config.vars')

const CURRENT_DIR = path.join(__dirname)
const MIME_TYPES = ['image/jpeg', 'image/png']

// console.log(CURRENT_DIR)
// console.log(path.join(CURRENT_DIR, 'uploads/receipts'))

// CONFIG multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(CURRENT_DIR, 'uploads/receipts'))
  },
  filename: function (req, file, cb) {
    // fieldname - comprobante
    const uniqueSuffix = Date.now() + '_' + req.body.providerName.toUpperCase() + '_' + new Date().toJSON().split('T')[0]
    // comprobante_1324653216_AGUACATE+ROBERTO_2023-10-14.jpg
    cb(null, file.fieldname + '_' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (MIME_TYPES.includes(file.mimetype)) return cb(null, true)
    else cb(new Error(`Only ${MIME_TYPES.join(' ')} mimetypes are allowed`))
  },
  limits: {
    files: 1,
    fieldSize: 2000000 // 2mb
  }
})

// const Sheet = require('./middlewares/authSheets')

// const getSheetInfo = async () => {
//   await Sheet.loadInfo()

//   console.log(Sheet.title)

//   const sheet = Sheet.sheetsByTitle['Datos Proveedores']

//   const rows = await sheet.getRows()
//   // console.log(rows.toObject())
//   const data = rows.map(r => r.toObject())
//   // rows.forEach(r => console.log(r.toObject()))
//   console.log(data)
//   console.log(sheet.rowCount)
//   console.log(rows.length)
// }

app.use(cors({
  origin: ['http://localhost:3000', 'https://demo.dashboardpack.com'],
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}))

// GOOGLE SHEETS - CREDENTIALS
// const fs = require('fs').promises
// const proces = require('process')
// const { authenticate } = require('@google-cloud/local-auth')
// const { google } = require('googleapis')
// // If modifying these scopes, delete token.json.
// const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
// // The file token.json stores the user's access and refresh tokens, and is
// // created automatically when the authorization flow completes for the first
// // time.
// const TOKEN_PATH = path.join(process.cwd(), 'token.json')
// const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json')

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', ['http://localhost:3000', 'https://demo.dashboardpack.com']) // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Methods', 'GET, POST')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept', 'application/json', 'form-data', 'multipart/form-data', 'application/x-www-form-urlencoded')
  next()
})

require('dotenv').config()
// app.use(expressValidator())
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')))

app.use(session({
  secret: secretKey,
  resave: true,
  saveUninitialized: false,
  cookie: { secure: false },
  unset: 'destroy'
}))
app.use(express.static(path.join(__dirname, '/public')))

// app.use(expressLayouts)
app.set('views', path.join(__dirname, 'views'))
// app.set('trust proxy', 1) // trust first proxy
app.set('layout', './layouts/full-header')
// Set view engine
app.set('view engine', 'ejs')
// app.set('layout', './layouts/layout')

const indexRouter = require('./routes/index')
const productRouter = require('./routes/products.route')
const offerRouter = require('./routes/offers.route')
const salesRouter = require('./routes/sales.route')
const refundsRouter = require('./routes/refunds.route')
const purchasesRouter = require('./routes/purchases.route')
const suppliersRouter = require('./routes/suppliers.route')
const moneyAccountsRouter = require('./routes/moneyAccounts.route')
const paymentsRouter = require('./routes/payments.route')
const registerClosuresRouter = require('./routes/registerClosures.route')
const againstReceiptsRouter = require('./routes/againstReceipts.route')

app.use('/', indexRouter)
app.use('/purchases', upload.single('comprobante'), purchasesRouter)
app.use('/against-receipts', againstReceiptsRouter)
app.use('/money-accounts', moneyAccountsRouter)
app.use('/suppliers', suppliersRouter)
app.use('/refunds', refundsRouter)
app.use('/products', productRouter)
app.use('/payments', paymentsRouter)
app.use('/sales', salesRouter)
app.use('/registers', registerClosuresRouter)
app.use('/offers', offerRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  if (!req.session || !req.session.accessToken) return next(createError(401, 'No se encontró ninguna sesión. Por favor inicia sesión para ingresar.'))
  console.log(res.status)
  return next(createError(404, 'No encontramos el recurso que buscas.'))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  console.log('err', err)
  // render the error page
  return res.status(err.status || 500).json({
    message: err.message,
    status: err.status,
    isErr: true
  })
  // return res.render('pages/error', {
  //   error: err
  // })
})
module.exports = app
