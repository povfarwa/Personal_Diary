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
    res.render('register', {error: null})
})

app.post('/register', async (req, res) => {
    const { usernme, password } = req.body
    try {
        let user = await bcrypt.hash(password, 10);
        if(user) return res.render('register', { error: "Username alreadytaken"})
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new user({ username, password: hashedPassword })
        await user.save()
        res.redirect('/login')
    } catch (err) {
        res.status(500).send('Server Error')
    }
});

app.get('/login', (req, res) => {
    res.render('login', {error: null})
})

pp.post('/login', async (req, res) => {
    const { username, password } = req.body
    try{
        const user = await UserActivation.findOne({ username })
        if(!user) return res.render('login', { error: 'Invalid User'})
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.render('login', { error: 'Invalid Creadentials'})
        
        const token = jwt.sign({ id: user._id }), process.env.JWT_SECRET, { expiresIn: '1h'};
        res.cookie('token', token, { httpOnly: true })
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).send('Server Error')
    }
})