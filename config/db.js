const mongoose = require ('mongoose')

const connectDB = async() => {
    try {
        await mongoose.connect(prrocess.env.MONGO_URI)
        console.log('Mongodb is connected')
    }catch(err){
         console.error(err.message);
        process.exit(1);
    }
}

module.exports = connectDB;