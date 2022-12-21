const mongoose = require("mongoose")
const schema = new mongoose.Schema({
    customer: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})
module.exports = mongoose.model("order", schema)