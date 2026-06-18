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

app.get('/logout', (req, res) => {
    res.clearCookie('token')
    res.clearCookie('diary_unlocked')
    res.redirect('/lock')
})

app.post('/login', async (req, res) => {
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

app.get('/dashboard', auth, async ()req, res)=> {
    try{
        const entries= await Entry.find({ user: req.user.id }).sort({ createdAt: -1 })
        res.render('dashboard', {entries})
    }catch (err){
        res.status(500).send('Server Error')
    }
}

app.get('/write', auth, (req, res) => {
    res.render('write', { entry:null })
})

app.get('/entry/:id', auth, async (req, res) => {
    try{
        const entry= await Entry.findOne({ _id: req.params.id, user: req.user.id })
        if (!entry) return res.redirect('/dashboard')
            res.render('write', { entry })
    }
    catch (err) {
        res.redirect('/dashboard')
    }
})

app.post('/entries', auth, async (req, res) => {
    const {title, content} = req.body
    try {
        const newEntry = new Entry({
            user: req.user.id,
            title,
            content
        })
        await newEntrry.save()
        res.redirect('/dashboard')
    } catch (err) {
        res.status(500).send('Server Error')
    }
})

app.post('/entries/edit/:id', auth, async (req, res) => {
    const {title, content} = req.body;
    try{
        await Entry.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { title, content}
        )
    }catch (err){
        res.status(500).send('Server Error')
    }
})

app.post('/entries/delete/:id', auth, async (req, res) => {
    try{
        await Entry.findOneAndDelete({ _idd: req.params.id, user: req.user.id})
        res.redirect('/dashboard')
    }catch (err) {
        res.status(500).send('Server Error')
    }
})

app.get('/settings', auth, (req, res) => {
    res.render('settings', { error: null, success: null })
})

