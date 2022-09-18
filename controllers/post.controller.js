const { default: mongoose } = require("mongoose");
const post = require("../modals/post.modal");
const user = require("../modals/user.modal");
// const notification=require("../modals/notification.modal")




const uploadPost = async (req, res) => {
  try {
    const { image, text } = req.body;
    if (!image && !text) {
      return res.status(404).json({ success: false, message: "provide image or image and text" })
    }

    if (image && text) {
      const data = await post.create({ image, text, postedby: req.userid })
    } else if (image) {
      const data = await post.create({ image, postedby: req.userid })
    } else {
      return res.status(500).json({ success: false, message: "provide image or image and text field" })
    }
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ success: false, message: "server error" })
  }
}


const doReact = async (req, res) => {
  try {
    const { postid, like } = req.body
    if (!postid) {
      return res.status(404).json({ success: false, message: "postid is not provided" })
    }
    if (mongoose.Types.ObjectId.isValid(postid)) {
      const _id = mongoose.Types.ObjectId(postid)
      if (like) {
        const data = await post.findByIdAndUpdate(_id, { $push: { likes: { by: req.userid } } }, { new: true })
        return res.status(200).json({ success: true, data: "liked" })
      } else {
        const data = await post.findByIdAndUpdate(_id, { $pull: { likes: { by: req.userid } } }, { new: true })
        return res.status(200).json({ success: true, data: "disliked" })
      }
    } else {
      return res.status(401).json({ success: false, message: "invalid postid" })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "server error" })
  }
}

const comment = async (req, res) => {
  //   try {
  //       const {postid,comm,postedby}=req.body;
  //       if(postid && comm){
  //         const data=await post.findByIdAndUpdate(postid,{$push:{comments:{by:req.userid,comm:comm}}},{new:true})
  //         if(postedby!==req.userid){
  //           await notification.create({to:postedby,from:req.userid,onpost:postid,category:"commented",comm,commid:data._id})
  //         }
  //         res.status(200).json({success:true})
  //       }else{
  //           res.status(500).json({success:false,error:"all fields are required"})
  //       }
  //   } catch (error) {
  //     res.status(500).json({success:false,error:"your action was not fullfilled"})
  //   }
}

const getPost = async (req, res) => {
  try {

    const data = await post.find().populate('postedby', "_id name dp").select("-__v")
    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: "server error" })
  }
}

const getSubPosts = async (req, res) => {
  try {
    const skip = Number(req.query.skip) || 0
    const data = await post.aggregate([
      { $sort: { datetime: -1 } },
      { $skip: skip },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: 'postedby', foreignField: '_id', as: 'postedby' } },
      { $unwind: '$postedby' },
      {
        $project: {
          image: 1,
          datetime: 1,
          text: 1,
          isLiked: { $in: [mongoose.Types.ObjectId(req.userid), "$likes.by"] },
          postedby: {
            _id: 1,
            name: 1,
            dp: 1,
            dob: 1,
            about: 1,
            gender: 1,
          },
          likes: { $cond: { if: { $isArray: "$likes" }, then: { $size: "$likes" }, else: 0 } },
          comments: { $cond: { if: { $isArray: "$comments" }, then: { $size: "$comments" }, else: 0 } },
        }
      },
    ])
    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "server error" })
  }
}

const getSpecificPost = async (req, res) => {
  // try {
  //     const {postid}=req.query
  //     const {userid}=req
  //       const data=await post.findById(postid).populate('postedby',"_id name dp")
  //       res.status(200).json({success:true,data:{
  //          _id:data._id,
  //         image:data.image,
  //         text:data.text,
  //         postedby:data.postedby,
  //         datetime:data.datetime,
  //         now:new Date(Date.now()),
  //         likes:data.likes.length,
  //         comments:data.comments.length,
  //         ilike:data.likes.some(u=>u.by==userid)
  //       }})

  // } catch (error) {
  //   res.status(500).json({success:false,error:"server error"})
  // }

}

const getComments = async (req, res) => {
  // try {
  //     const {postid}=req.query
  //       const {comments}=await post.findById(postid).select("comments").populate("comments.by","_id name dp").sort({'comments.datetime':-1})
  //       res.status(200).json({success:true,data:comments})

  // } catch (error) {
  //   res.status(500).json({success:false,error:"server error"})
  // }

}


const getUserPosts = async (req, res) => {
  try {
    let _id = req.query.id
    const skip = Number(req.query.skip) || 0
    if (!_id) {
      return res.status(404).json({ success: false, message: "id is not provided" })
    }
    if (mongoose.Types.ObjectId.isValid(_id)) {
      _id = mongoose.Types.ObjectId(_id)
      const data = await post.aggregate([
        { $match: { postedby: _id } },
        { $sort: { datetime: -1 } },
        { $skip: skip },
        { $limit: 9 },
        {
          $project: {
            image: 1,
            likes: { $cond: { if: { $isArray: "$likes" }, then: { $size: "$likes" }, else: 0 } },
            comments: { $cond: { if: { $isArray: "$comments" }, then: { $size: "$comments" }, else: 0 } }
          }
        },


      ])
      return res.status(200).json({ success: true, data })
    } else {
      return res.status(401).json({ success: false, message: "invalid id" })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "server error" })
  }
}

const deletePost = async (req, res) => {
  try {
    const { postid } = req.query
    const { userid } = req
    if (!postid) {
      return res.status(404).json({ success: false, message: "postid is not provided" })
    }
    if (!mongoose.Types.ObjectId.isValid(postid)) {
      return res.status(404).json({ success: false, message: "postid is not valid" })
    }


    const { postedby } = await post.findById(postid).select("postedby");
    if (postedby.toString() === userid) {
      const data = await post.findByIdAndDelete(postid, { new: true })
      return res.status(200).json({ success: true, data })
    } else {
      return res.status(401).json({ success: false, message: "this post doesnt belongs to you" })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "post no longer exists" })
  }
}
const getAlert = async (req, res) => {
  // try {
  //   const {userid}=req
  //   var id = mongoose.Types.ObjectId(userid);
  //   const data =await post.aggregate([
  //     {$match:{postedby:id}},
  //     {$project:{
  //       comments:1
  //     }},
  //     {$unwind:"$comments"},
  //     {$sort:{"comments.datetime":-1}}
  //   ])
  //   res.status(200).json({success:true,data})
  // } catch (error) {
  //   res.status(500).json({success:false,error:"server error"})
  // }
}
module.exports = {
  getPost, doReact, comment, getSubPosts, uploadPost, getUserPosts, getSpecificPost, getComments, deletePost, getAlert
}