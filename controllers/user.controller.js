const user = require("../modals/user.modal")
// const post = require("../modals/post.modal")
// const follow = require("../modals/follow.modal")
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const getLoggedInUserInfo = async (req, res) => {
    try {
        let _id = req.userid
        if (!_id) {
            return res.status(404).json({ success: false, message: "id is not found in token" })
        }
        if (mongoose.Types.ObjectId.isValid(_id)) {
            _id = mongoose.Types.ObjectId(_id)
            const data = await user.findOne({ _id }).select('_id name dp followers following dob gender about')
            if (!data) {
                return res.status(404).json({ success: false, message: 'user not found' })
            }
            return res.status(200).json({
                success: true, data: {
                    _id: data._id,
                    name: data.name,
                    dp: data.dp,
                    followers: data.followers.length,
                    following: data.following.length,
                    dob:data.dob,
                    gender:data.gender,
                    about:data.about
                }
            })
        } else {
            return res.status(401).json({ success: false, message: "invalid id in token" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "server error" })
    }
}
const getUserById = async (req, res) => {
    // try {
    //     let _id = req.query.id
    //     if (!_id) {
    //         return res.status(404).json({ success: false, message: "id is not provided" })
    //     }
    //     if (mongoose.Types.ObjectId.isValid(_id)) {
    //         _id = mongoose.Types.ObjectId(_id)
    //         const userInfo = await user.findOne({ _id }).select('_id name dp')
    //         if (!userInfo) {
    //             return res.status(404).json({ success: false, message: 'user not found' })
    //         }
    //         const shorts =await post.find({postedby:_id}).count()
    //         const ifollow = await follow.findOne({to:_id,by:req.userid}).count()
    //         const followers=await follow.find({to:_id}).count()
    //         const followings=await follow.find({by:_id}).count()

    //         return res.status(200).json({ success: true, data:{
    //             name:userInfo.name,_id:userInfo._id,desc:userInfo.desc,image:userInfo.image,isVarified:userInfo.isVarified,
    //             shorts:shorts,ifollow:ifollow==0 ? false : true,
    //             followers,followings
    //         } })
    //     } else {
    //         return res.status(401).json({ success: false, message: "invalid id" })
    //     }
    // } catch (error) {
    //     console.log(error);
    //     return res.status(500).json({ success: false, message: "server error" })
    // }
}

const liveSearch = async (req, res) => {
    // try {
    //     const {name}=req.query
    //       const data=await user.find({name:{$regex: '^' + name, $options: 'i'}}).select("name image _id isVarified").sort({datetime:-1})
    //       res.status(200).json({success:true,data})
    // } catch (error) {
    //   res.status(500).json({success:false,message:"server error"})
    // }
}

const editProfile = async (req, res) => {
    // try {
    //     const {name,desc}=req.body
    //     if (!name) {
    //         return res.status(404).json({ success: false, message: "name is not provided" })
    //       }
    //       const data=await user.findByIdAndUpdate(req.userid,{name,desc},{new:true})
    //       const token = jwt.sign(JSON.stringify({_id:data._id,image:data.image, name: data.name,isVarified:data.isVarified }), process.env.JWT_SECRET)
    //       res.status(200).json({success:true,data:token})
    // } catch (error) {
    //   res.status(500).json({success:false,message:"server error"})
    // }
}

const updateDp = async (req, res) => {
    // try {
    //     const {url}=req.body
    //     if (!url) {
    //         return res.status(404).json({ success: false, message: "url is not provided" })
    //       }
    //       const data=await user.findByIdAndUpdate(req.userid,{image:url},{new:true})
    //       const token = jwt.sign(JSON.stringify({_id:data._id,image:data.image, name: data.name,isVarified:data.isVarified }), process.env.JWT_SECRET)
    //       res.status(200).json({success:true,data:token})
    // } catch (error) {
    //   res.status(500).json({success:false,message:"server error"})
    // }
}
module.exports = {
    getLoggedInUserInfo,
    getUserById,
    liveSearch,
    editProfile,
    updateDp
}