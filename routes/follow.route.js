const express=require("express")
const follow= express.Router()
const { doFollow } = require("../controllers/follow.controller")
follow.post("/",doFollow)
module.exports=follow