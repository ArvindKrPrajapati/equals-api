const mongoose = require('mongoose')
const otps =new mongoose.Schema({
    mobile:{
        type:Number,
        required:true,
        unique:true
    },
    otp:{
        type:Number,
        required:true
    }
},{timestamps: true})

module.exports=mongoose.model('otps',otps)