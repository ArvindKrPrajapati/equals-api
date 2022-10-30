const mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema.Types;

const user = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    dp: {
        type: String
    },
    cover: {
        type: String
    },
    dob: {
        type: Date,
        default: null
    },
    gender: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true,
        unique: true,
        trim: true
    },
    about: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    accountCreated: {
        type: Boolean,
        default: false
    },
    datetime: { type: Date, default: Date.now }

});

module.exports = mongoose.model("user", user);