const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()



const http = require("http")
const socket = require("socket.io")
const server = http.createServer(app)

const io = socket(server, {
    transports: ['polling'],
    cors: {
        cors: {
            origin: "*"
        }
    }
})
io.on('connection', (socket) => {
    console.log('A user is connected');

    socket.on('message', (message) => {
        console.log(`message from ${socket.id} : ${message}`);
        io.emit("message", "hello from server")
    })

    socket.on('disconnect', () => {
        console.log(`socket ${socket.id} disconnected`);
    })
})
module.exports = { io }




const orders = require("./routes/order.routes")
const auth = require("./routes/auth.route")
const postroute = require("./routes/post.route")
const user = require("./routes/user.route")
const follow = require("./routes/follow.route")
const message = require("./routes/message.route")
// for youtube
const youtube = require("./routes/youtube.route")

const PORT = process.env.PORT || 5000
const authlogin = require("./middleware/auth.middleware")

app.use(express.json())
app.use(cors())

app.use("/v1/orders", orders)
app.use("/v1/auth", auth)
app.use("/v1/post", authlogin, postroute)
app.use("/v1/user", authlogin, user)
app.use("/v1/follow", authlogin, follow)
app.use("/v1/message", authlogin, message)
app.use("/v1/youtube", youtube)




app.get("/", (req, res) => {
    res.status(200).json({ msg: "welcome v1" })
})

const init = async () => {
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(process.env.URL)
        server.listen(PORT, () => console.log('server is listening at PORT ' + PORT))
    } catch (error) {
        console.log(error)
    }
}
init()