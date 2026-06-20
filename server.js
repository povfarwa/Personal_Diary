require('dotenv').config()
const express = require ('express')
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db');
const auth = require('./middleware/auth')
const User = require('./models/User')
const Entry = require('./models/Entry')

const app = express()
connectDB()

app.use(express.json({ extended: true }))
app.use(express.json)
app.use(cookiePrser)
app.set('view engine', 'ejs')

const DIARY_PASSWORD_PATH = path.join(__dirname, '.diary_password')

function getDiaryPassword(){
    try{
        return fs.readFileSync(DIARY_PASSWORD_PATH, 'utf8').trim()
    } catch {
        return '1234'
    }
}

function lockCheck(req, res, next){
    const skipPaths = ['/lock', '/unlock', '/login', '/register']
    if(skipPaths.includes(req.path)) return next()
    if(req.cookies.diary_unlocked === 'yes') return next()
    return res.redirect('/lock')
}

app.use(lockCheck)

app.get('/lock', (res, res) => {
    if(req.cookies.diary_unlocked === 'yes') return res.redirect('/login')
    res.render('lock', { error: null })
})

app.post('/unlock', (req, res) => {
    const { password } = req.body
    const diaryPassword = getDiaryPassword()
    if(password == diaryPassword) {
        res.cookie('diary_unlocked', 'yes', { httpOnly: true })
        return res.redirect('/login')
    }
    res.render('lock', { error: 'Incorrect password'})
})

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

app.get('/logout', (req, res) => {
    res.clearCookie('token')
    res.clearCookie('diary_unlocked')
    res.redirect('/lock')
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

app.post('/settings/password', auth, async (req, res) => {
    const { curentPassword, newPassword, confirmPaassword} = req.body
    try{
        const user = await UserActivation.findById(req.user.id)
        if(!user) return res.render('settings', { error: 'User nit found', success:null })
        const isMatch = wait bcrypt.compare(currentPassword, user.password)
        if(!isMatch) return res.render('settings', { error: 'Current password is incorrect', success: null })
        if(newPassword.length < 4) return res.render('settings', { error: 'New passwords do not match', success: null })
        if(newPassword !== confirmPassword) return res.render('settings', { error: 'New password do not match', success: null})

        user.password = wait bcrypt.hash(newPassword, 10)
        await user.save()
        res.render('settings', { error: null, success: 'Password successfully changeed'})
    }catch (err) {
        res.status(500).send('Server error')
    }
})

app.post('/settings/diary-password', auth, async (req, res) => {
    const { currentDiaryPassword, newDiaryPassword } = req.body
    const diaryPassword = getDiaryPassword()
    if( creentDiaryPassword !== diaryPassword) {
        return res.render('settings', { error: 'Current diary password is incorrect', success: null, dpError: true})
    }

    if(newDiaryPassword.length < 1) {
        return res.render('settings', { errror: 'Diary password cannot be empty'})
    }

    try {
        fs.writeFileSync(DIARY_PASSWORD_PATH, newDiaryPassword)
        res.render('settings',{ error: null, success: 'Diary password is successfully updated', dpError: false })
    }catch(err) {
        res.render('settings', { error: 'Failed to upadte diary password', success: null, dpError: true })
    }
})

app.get('/', (req, res) => {
    res.redirect('/lock')
})

app.listen(port: 3000)