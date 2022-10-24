const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const post = new mongoose.Schema({
  image: String,
  text: String,
  postedby: {
    type: ObjectId,
    ref: 'user'
  },
  likes: [{
    by: { type: ObjectId, ref: 'user', unique: true },
    datetime: { type: Date, default: Date.now }
  }],
  comments: [
    {
      by: { type: ObjectId, ref: 'user' },
      comm: String,
      likes: [{
        by: { type: ObjectId, ref: 'user', unique: true },
        datetime: { type: Date, default: Date.now }
      }],
      datetime: { type: Date, default: Date.now }
    }
  ],
  datetime: { type: Date, default: Date.now }

})

module.exports = mongoose.model("post", post)
