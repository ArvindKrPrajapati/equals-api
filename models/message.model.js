const mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema.Types;

const schema = new mongoose.Schema({
    roomId: {
        required: true,
        type: String,
        unique: true
    },
    status: [{
        _id: { type: ObjectId, ref: "user" },
        seen: { type: Date },
        typing: { type: Boolean, default: false }
    }],
    messages: [{
        sender: { type: ObjectId, ref: 'user' },
        receiver: { type: ObjectId, ref: 'user' },
        text: { type: String },
        image: { type: String },
        video: { type: String },
        datetime: { type: Date, default: Date.now }
    }]
})
module.exports = mongoose.model("messages", schema)