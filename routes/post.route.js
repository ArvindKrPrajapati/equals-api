const express =require("express");
const postroute=express.Router();


const { getPost, doReact, comment, getSubPosts, uploadPost, getUserPosts, getSpecificPost, getComments, deletePost, getAlert, likeOncomment, dislikeOncomment, replyComment, likeOnReplycomment, deleteComment, deleteReplyComment} = require("../controllers/post.controller");

postroute.route("/").get(getPost)
postroute.route("/deletepost").get(deletePost)
postroute.route("/delete-comment").put(deleteComment)
postroute.route("/delete-reply-comment").put(deleteReplyComment)
postroute.route("/getuserposts").get(getUserPosts)
postroute.route("/getspecificpost").get(getSpecificPost)
postroute.route("/getcomments").get(getComments)
postroute.route("/react").put(doReact)
postroute.route("/comment").put(comment)
postroute.route("/comment/like").put(likeOncomment)
postroute.route("/comment/reply/like").put(likeOnReplycomment)
postroute.route("/comment/reply").put(replyComment)
postroute.route("/comment/dislike").put(dislikeOncomment)
postroute.route("/getsubpost").get(getSubPosts)
postroute.post("/upload",uploadPost)
postroute.get("/alert",getAlert)

module.exports=postroute