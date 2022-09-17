const express=require("express")
const follow= express.Router()
const { doFollow,getFollowers, getFollowings } = require("../controllers/follow.controller")
follow.post("/",doFollow)
follow.get("/get-followers",getFollowers)
follow.get("/get-followings",getFollowings)
module.exports=follow