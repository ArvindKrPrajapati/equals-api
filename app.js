const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const auth = require("./routes/auth.route")
// const movie = require("./routes/movie.route")
// const postroute = require("./routes/post.route")
// const user = require("./routes/user.route")
// const follow = require("./routes/follow.route")
// const authlogin = require("./middleware/auth.middleware")
const PORT = process.env.PORT || 3000
app.use(express.json())
app.use(cors())
app.use("/v1/auth", auth)
// app.use("/v1/movie", movie)
// app.use("/v1/post", authlogin, postroute)
// app.use("/v1/user", authlogin, user)
// app.use("/v1/follow", authlogin, follow)



app.get("/", (req, res) => {
    res.status(200).json({ msg:"wlcome" })
})

const init = async () => {
    try {
        await mongoose.connect(process.env.URL)
        app.listen(PORT, () => console.log('server is listening at PORT ' + PORT))
    } catch (error) {
        console.log(error)
    }
}
init()