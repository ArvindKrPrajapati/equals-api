const { default: mongoose } = require("mongoose");
const post = require("../modals/post.modal");
const user = require("../modals/user.modal");


// helper functons
const isPostExists = async (id) => {
  const data = await post.findById(id)
  return data
}
// ends

const getPost = async (req, res) => {
  try {

    const data = await post.find().populate('postedby', "_id name dp").select("-__v")
    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: "server error" })
  }
}

const uploadPost = async (req, res) => {
  try {
    const { image, text } = req.body;
    if (!image && !text) {
      return res.status(404).json({ success: false, message: "provide image or image and text" })
    }
    let data
    if (image && text) {
      data = await post.create({ image, text, postedby: req.userid })
    } else if (image) {
      data = await post.create({ image, postedby: req.userid })
    } else if (text) {
      data = await post.create({ text, postedby: req.userid })
    } else {
      return res.status(500).json({ success: false, message: "provide image or image and text field" })
    }
    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "server error" })
  }
}


const doReact = async (req, res) => {
  try {
    const { postid, action } = req.body
    if (!postid || !action) {
      return res.status(404).json({ success: false, message: "postid and action  is not provided" })
    }
    if (mongoose.Types.ObjectId.isValid(postid)) {
      const _id = mongoose.Types.ObjectId(postid)
      const isExist = await isPostExists(_id)
      if (isExist) {
        if (action === "like") {
          const data = await post.findByIdAndUpdate(_id, { $push: { likes: { by: req.userid } } }, { new: true })
          return res.status(200).json({ success: true, data: "liked" })
        } else if (action === "dislike") {
          const data = await post.findByIdAndUpdate(_id, { $pull: { likes: { by: req.userid } } }, { new: true })
          return res.status(200).json({ success: true, data: "disliked" })
        } else {
          return res.status(200).json({ success: false, data: "invalid action" })
        }
      }
    }
    return res.status(401).json({ success: false, message: "invalid postid or post no longer exists" })
  } catch (error) {
    return res.status(500).json({ success: false, message: "server error" })
  }
}

const comment = async (req, res) => {
  try {
    const { postid, comm } = req.body
    if (!postid || !comm) {
      return res.status(404).json({ success: false, message: "postid or comm is not provided" })
    }

    if (mongoose.Types.ObjectId.isValid(postid)) {
      const _id = mongoose.Types.ObjectId(postid)
      const isExist = await isPostExists(_id)
      if (isExist) {
        const data = await post.findByIdAndUpdate(_id, { $push: { comments: { by: req.userid, comm } } }, { new: true })
        return res.status(200).json({ success: true, data: data?.comments })
      }
    }
    return res.status(401).json({ success: false, message: "invalid postid or post no longer exists" })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "server error" })
  }
}

const likeOncomment = async (req, res) => {
  try {
    let { postid, commid } = req.body
    const myid = req.userid
    if (!postid || !commid) {
      return res.status(404).json({ success: false, message: "postid or commid is not provided" })
    }

    if (mongoose.Types.ObjectId.isValid(postid) && mongoose.Types.ObjectId.isValid(commid)) {
      postid = mongoose.Types.ObjectId(postid)
      commid = mongoose.Types.ObjectId(commid)
      const data = await post.updateOne({ _id: postid, "comments._id": commid },
        { $push: { "comments.$.likes": { by: myid } } },
        { new: true })
      if (!data.acknowledged) {
        return res.status(200).json({ success: false, message: "failed" })
      }
      return res.status(200).json({ success: true, data: data })
    } else {
      return res.status(401).json({ success: false, message: "invalid postid or commid" })
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "server error" })
  }
}

const dislikeOncomment = async (req, res) => {
  try {
    let { postid, commid } = req.body
    const myid = req.userid
    if (!postid || !commid) {
      return res.status(404).json({ success: false, message: "postid or commid is not provided" })
    }

    if (mongoose.Types.ObjectId.isValid(postid) && mongoose.Types.ObjectId.isValid(commid)) {
      postid = mongoose.Types.ObjectId(postid)
      commid = mongoose.Types.ObjectId(commid)
      const data = await post.updateOne({ _id: postid, "comments._id": commid },
        { $pull: { "comments.$.likes": { by: myid } } },
        { new: true })
      if (!data.acknowledged) {
        return res.status(200).json({ success: false, message: "failed" })
      }
      return res.status(200).json({ success: true, data: data })
    } else {
      return res.status(401).json({ success: false, message: "invalid postid or commid" })
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "server error" })
  }
}

const deleteComment = async (req, res) => {
  try {
    let { postid, commid } = req.body
    if (!postid || !commid) {
      return res.status(404).json({ success: false, message: "postid or commid is not provided" })
    }

    if (mongoose.Types.ObjectId.isValid(postid) && mongoose.Types.ObjectId(commid)) {
      postid = mongoose.Types.ObjectId(postid)
      commid = mongoose.Types.ObjectId(commid)
      const data = await post.findByIdAndUpdate({ _id: postid },
        { $pull: { comments: { by: req.userid, _id: commid } } },
        { new: true })
      return res.status(200).json({ success: true, data: "if comment exists and belongs to you then its deleted" })
    } else {
      return res.status(401).json({ success: false, message: "invalid postid" })
    }
  } catch (error) {
    console.log(error);
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
      return res.status(200).json({ success: true, data: "deleted" })
    } else {
      return res.status(401).json({ success: false, message: "this post doesnt belongs to you" })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "post no longer exists" })
  }
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

module.exports = {
  getPost,
  doReact,
  comment,
  getSubPosts,
  uploadPost,
  getUserPosts,
  getSpecificPost,
  deletePost,
  likeOncomment,
  dislikeOncomment,
  deleteComment,
}