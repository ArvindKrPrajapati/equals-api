const express = require("express")
const route = express.Router()
const { sendOtp,variefyOtpAndCreate, login } = require("../controllers/auth.controller")

route.post("/send-otp", sendOtp)
route.post("/login", login)
route.post("/varify-otp-create", variefyOtpAndCreate)

module.exports=route