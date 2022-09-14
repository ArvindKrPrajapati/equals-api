const express=require("express")
const user= express.Router()
const { getUserById, liveSearch, editProfile, updateDp, getLoggedInUserInfo } = require("../controllers/user.controller")
user.get("/",getUserById)
user.get("/loggedin-user",getLoggedInUserInfo)
user.get("/search",liveSearch)
user.patch("/edit",editProfile)
user.patch("/updatedp",updateDp)
module.exports=user