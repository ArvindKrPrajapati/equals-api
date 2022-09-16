const user = require("../modals/user.modal")
const post = require("../modals/post.modal")
const follow = require("../modals/follow.modal")
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
            const data = await user.findOne({ _id }).select('_id name dp gender dob about')
            if (!data) {
                return res.status(404).json({ success: false, message: 'user not found' })
            }
            return res.status(200).json({
                success: true, data: {
                    _id: data._id,
                    name: data.name,
                    dp: data.dp,
                    gender: data.gender,
                    dob:data.dob,
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
    try {
        let _id = req.query.id
        if (!_id) {
            return res.status(404).json({ success: false, message: "id is not provided" })
        }
        if (mongoose.Types.ObjectId.isValid(_id)) {
            _id = mongoose.Types.ObjectId(_id)
            const userInfo = await user.findOne({ _id }).select('_id name dp about dob gender')
            if (!userInfo) {
                return res.status(404).json({ success: false, message: 'user not found' })
            }
            const posts = await post.find({ postedby: _id }).count()
            const ifollow = await follow.findOne({ to: _id, by: req.userid }).count()
            const followers = await follow.find({ to: _id }).count()
            const followings = await follow.find({ by: _id }).count()

            return res.status(200).json({
                success: true, data: {
                    name: userInfo.name,
                    _id: userInfo._id,
                    about: userInfo.about,
                    posts: posts,
                    dp: userInfo.dp,
                    gender: userInfo.gender,
                    ifollow: ifollow == 0 ? false : true,
                    followers,
                    followings
                }
            })
        } else {
            return res.status(401).json({ success: false, message: "invalid id" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "server error" })
    }
}

const liveSearch = async (req, res) => {
    try {
        const { name } = req.query
        const skip = Number(req.query.skip) || 0

        const data = await user.find({ name: { $regex: '^' + name, $options: 'i' } }).select("name dp gender _id ").sort({ datetime: -1 }).skip(skip).limit(20)
        res.status(200).json({ success: true, data })
    } catch (error) {
        res.status(500).json({ success: false, message: "server error" })
    }
}

const editProfile = async (req, res) => {
    try {
        const { name, about, dob, gender } = req.body
        if (!name) {
            return res.status(404).json({ success: false, message: "name is not provided" })
        }
        const data = await user.findByIdAndUpdate(req.userid, { name, about, dob, gender }, { new: true })
        getLoggedInUserInfo(req, res)
    } catch (error) {
        res.status(500).json({ success: false, message: "server error" })
    }
}

const updateDp = async (req, res) => {
    try {
        const { dp } = req.body
        if (!dp) {
            return res.status(404).json({ success: false, message: "dp is not provided" })
        }
        const data = await user.findByIdAndUpdate(req.userid, { dp }, { new: true })
        getLoggedInUserInfo(req, res)
    } catch (error) {
        res.status(500).json({ success: false, message: "server error" })
    }
}
module.exports = {
    getLoggedInUserInfo,
    getUserById,
    liveSearch,
    editProfile,
    updateDp
}