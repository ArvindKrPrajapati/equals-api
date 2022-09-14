const { default: mongoose } = require("mongoose");
const  post  = require("../modals/post.modal");
const  user  = require("../modals/user.modal");
// const notification=require("../modals/notification.modal")




const uploadPost=async (req,res)=>{
  try {
      const {image,text}=req.body;
      if(!image && !text){
        return res.status(404).json({success:false,message:"provide image or image and text"})
      }
      
      if(image && text){
        const data=await post.create({image,text,postedby:req.userid})
      }else if(image){
        const data=await post.create({image,postedby:req.userid})
      }else{
          return res.status(500).json({success:false,message:"provide image or image and text field"})
      }
      return res.status(200).json({success:true})
  } catch (error) {
    return res.status(500).json({success:false,message:"server error"})
  }
}


const doReact=async (req,res)=>{
//   try {
//       const {action,postid,postedby}=req.body;
//       if(postid && action==="like"){
//         const data=await post.findByIdAndUpdate(postid,{$push:{likes:{by:req.userid}}})
//         if(postedby!==req.userid){
//         await notification.create({to:postedby,from:req.userid,onpost:postid,category:"liked"})
//         }
//         res.status(200).json({success:true})
//       }else if(postid && action==="unlike"){
//         const data=await post.findByIdAndUpdate(postid,{$pull:{likes:{by:req.userid}}})
//         if(postedby!==req.userid){
//         await notification.findOneAndDelete({to:postedby,from:req.userid,onpost:postid,category:"liked"})
//         }
//         res.status(200).json({success:true})
//       }else{
//           res.status(500).json({success:false,error:"all fields are required"})
//       }
//   } catch (error) {
//     res.status(500).json({success:false,error:"your action was not fullfilled"})
//   }
}

const comment=async (req,res)=>{
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

const getPost=async (req,res)=>{
    try {
       
          const data=await post.find().populate('postedby',"_id name dp").select("-__v")
          res.status(200).json({success:true,data})
    } catch (error) {
      res.status(500).json({success:false,error:"server error"})
    }
  }
  
  const getSubPosts=async (req,res)=>{
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
                  datetime:1,
                  text: 1,
                  isLiked: { $in: [mongoose.Types.ObjectId(req.userid), "$likes.by"] },
                  postedby: { _id: 1, name: 1, dp: 1 },
                  likes: { $cond: { if: { $isArray: "$likes" }, then: { $size: "$likes" }, else: 0 } },
                  comments: { $cond: { if: { $isArray: "$comments" }, then: { $size: "$comments" }, else: 0 } },
              }
          },
      ])
      return res.status(200).json({ success: true, data })
  } catch (error) {
    return res.status(500).json({success:false,message:"server error"})
  }
  }

  const getSpecificPost=async (req,res)=>{
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

  const getComments=async (req,res)=>{
    // try {
    //     const {postid}=req.query
    //       const {comments}=await post.findById(postid).select("comments").populate("comments.by","_id name dp").sort({'comments.datetime':-1})
    //       res.status(200).json({success:true,data:comments})

    // } catch (error) {
    //   res.status(500).json({success:false,error:"server error"})
    // }
   
  }


  const getUserPosts=async (req,res)=>{
//     const {id}=req.query
//     const userid=req.userid
//     const data=await post.find({postedby:id}).populate('postedby',"_id name dp").select("-__v").sort({datetime:-1})
//     let f=[];
//    await data.map((o)=>{
//      f.push({
//      _id:o._id,
//      image:o.image,
//      text:o.text,
//      postedby:o.postedby,
//      datetime:o.datetime,
//      now:new Date(Date.now()),
//      likes:o.likes.length,
//      comments:o.comments.length,
//      ilike:o.likes.some(u=>u.by==userid)
//      })
//    })
//    res.status(200).json({success:true,data:f})
    
  }

  const deletePost=async (req,res)=>{
    // try {
    //      const {postid}=req.query
    //      const {userid}=req
    //       const {postedby}=await post.findById(postid).select("postedby");
    //       if(postedby.toString()===userid){
    //         const data=await post.findByIdAndDelete(postid,{new:true})
    //         res.status(200).json({success:true,data})
    //       }else{
    //         res.status(401).json({success:false,error:"this post doesnt belongs to you"})
    //       }
    // } catch (error) {
    //   res.status(500).json({success:false,error:"post no longer exists"})
    // }
  }
  const getAlert=async (req,res)=>{
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
module.exports={
    getPost,doReact,comment,getSubPosts,uploadPost,getUserPosts,getSpecificPost,getComments,deletePost,getAlert
}