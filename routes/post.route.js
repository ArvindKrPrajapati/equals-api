const express =require("express");
const postroute=express.Router();


const { getPost, doReact, comment, getSubPosts, uploadPost, getUserPosts, getSpecificPost, getComments, deletePost, getAlert} = require("../controllers/post.controller");

postroute.route("/").get(getPost).patch(deletePost)
postroute.route("/getuserposts").get(getUserPosts)
postroute.route("/getspecificpost").get(getSpecificPost)
postroute.route("/getcomments").get(getComments)
postroute.route("/react").put(doReact)
postroute.route("/comment").put(comment)
postroute.route("/getsubpost").get(getSubPosts)
postroute.post("/upload",uploadPost)
postroute.get("/alert",getAlert)

module.exports=postroute