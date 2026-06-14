const express = require ('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const app = express()

app.use(express.json({ extended: true }))
app.use(express.json)
app.use(cookiePrser)
app.set('view engine', 'ejs')

app.get('/register', (req, res) => {
    res.render('/register')
})