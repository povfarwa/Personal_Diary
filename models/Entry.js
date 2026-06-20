const mongoose = require('mongoose')

const EntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref:'User', required: true
    },
    title: {
        type:String,
        required:true
    },

    content:{
        type:String,
        required:true
    },

    mood:{type:String, default: 'neutral'},

    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('Entry', EntrySchema)