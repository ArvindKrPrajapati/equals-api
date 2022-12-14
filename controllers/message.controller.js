const { default: mongoose } = require("mongoose")
const { io } = require("../app")
const messageModel = require("../models/message.model")
const userModel = require("../models/user.model")

const saveMessage = async (req, res) => {
    try {
        const { roomId, receiver, text, image, video } = req.body
        const sender = req.userid
        if (!sender) {
            return res.status(500).json({ success: false, message: "check your token" })
        }
        if (!roomId || !receiver) {
            return res.status(500).json({ success: false, message: "roomID ,reciever are required" })
        }
        if (!mongoose.Types.ObjectId.isValid(sender) || !mongoose.Types.ObjectId.isValid(receiver)) {
            return res.status(500).json({ success: false, message: "invalid sender or reciever id" })
        }
        if (!text && !image && !video) {
            return res.status(500).json({ success: false, message: "text or image or video is required" })
        }
        let room = await messageModel.findOne({ roomId })
        let info;
        if (!room) {
            console.log("inside room");
            room = await messageModel.create({ roomId })
            await userModel.findByIdAndUpdate(sender, { $push: { chats: { roomId: room._id } } }, { new: true })
            await userModel.findByIdAndUpdate(receiver, { $push: { chats: { roomId: room._id } } }, { new: true })
            info = await userModel.find({ _id: { $in: [sender, receiver] } })
        }
        const mess = {
            sender,
            receiver
        }
        if (text) {
            mess.text = text
        }
        if (image) {
            mess.image = image
        }
        if (video) {
            mess.video = video
        }
        const data = await messageModel.findByIdAndUpdate(room._id, { $push: { messages: mess } }, { new: true })


        const messages = data.messages.slice(-20).reverse()
        let senderData = { roomId, messages, datetime: messages[0].datetime, status: data.status }
        let receiverData = { roomId, messages, datetime: messages[0].datetime, status: data.status }
        if (info) {
            senderData["user"] = { _id: info[1]._id, name: info[1].name, dp: info[1].dp }
            receiverData["user"] = { _id: info[0]._id, name: info[0].name, dp: info[0].dp }
        }

        io.emit("chat-" + sender, { data: senderData })
        io.emit("chat-" + receiver, { data: receiverData })

        io.emit("room-" + roomId, { data: messages, status: data.status })
        return res.status(200).json({ success: true, data: "mess send" })


    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "server error" })
    }
}


const getMessages = async (req, res) => {
    try {
        const { id } = req.params
        const skip = Number(req.query.skip) || 0

        if (!id) {
            return res.status(500).json({ success: false, message: "id is required" })
        }

        const data = await messageModel.aggregate([
            { $match: { roomId: id } },
            {
                $unwind: {
                    path: '$messages'
                }
            },
            // { $lookup: { from: 'users', localField: 'messages.sender', foreignField: '_id', as: 'messages.sender' } },
            // { $lookup: { from: 'users', localField: 'messages.receiver', foreignField: '_id', as: 'messages.receiver' } },
            // {
            //     $unwind: {
            //         path: '$messages.sender'
            //     }
            // },
            // {
            //     $unwind: {
            //         path: '$messages.receiver'
            //     }
            // },
            {
                $project: {
                    _id: "$messages._id",
                    text: "$messages.text",
                    image: "$messages.image",
                    video: "$messages.video",
                    sender: "$messages.sender",
                    receiver: "$messages.sender",
                    status: 1,
                    // sender: { _id: "$messages.sender._id", name: "$messages.sender.name", mobile: "$messages.sender.mobile", dp: "$messages.sender.dp" },
                    // reciever: { _id: "$messages.receiver._id", name: "$messages.receiver.name", mobile: "$messages.receiver.mobile", dp: "$messages.receiver.dp" },
                    datetime: "$messages.datetime",
                }
            },
            { $sort: { datetime: -1 } },
            { $skip: skip },
            { $limit: 20 },
        ])
        return res.status(200).json({ success: true, data })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "server error" })
    }
}

const getChats = async (req, res) => {
    try {
        const { userid } = req
        const skip = Number(req.query.skip) || 0

        if (!userid) {
            return res.status(500).json({ success: false, message: "id is required,check your token" })
        }
        const _id = mongoose.Types.ObjectId(userid)
        const data = await userModel.aggregate([
            { $match: { _id } },
            {
                $unwind: {
                    path: "$chats"
                }
            },
            { $lookup: { from: 'messages', localField: 'chats.roomId', foreignField: '_id', as: 'chats' } },
            {
                $unwind: {
                    path: "$chats"
                }
            },
            {
                $project: {
                    _id: 0,
                    roomId: "$chats.roomId",
                    status: "$chats.status",
                    // messages: "$chats.messages",
                    // messages: {
                    //     $sortArray: { input: "$chats.messages", sortBy: { "messages.datetime": 1 } }
                    // }
                    last: { $arrayElemAt: ["$chats.messages", -1] },
                    messages: { $reverseArray: { $slice: ["$chats.messages", -20, 20] } },
                }
            },
            {
                $project: {
                    roomId: 1,
                    messages: 1,
                    status: 1,
                    datetime: "$last.datetime",
                    user: {
                        $cond: {
                            if: { $eq: ["$last.sender", _id] },
                            then: "$last.receiver",
                            else: "$last.sender"
                        }
                    },
                }
            },
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
            {
                $unwind: {
                    path: "$user"
                }
            },
            {
                $project: {
                    roomId: 1,
                    messages: 1,
                    status: 1,
                    datetime: 1,
                    user: {
                        _id: 1,
                        name: 1,
                        dp: 1
                    }
                }
            },
            { $sort: { datetime: -1 } },
            { $skip: skip },
            { $limit: 20 },
        ])
        return res.status(200).json({ success: true, data })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "server error" })
    }
}

const setSeenStatus = async (req, res) => {
    try {
        const { userid } = req
        const roomId = req.params.id
        const date = Date.now()
        if (!userid) {
            return res.status(500).json({ success: false, message: "id is required,check your token" })
        }

        let data;
        const isRoomExists = await messageModel.findOne({ roomId })

        if (isRoomExists) {
            const isExists = await messageModel.findOne({ roomId, status: { $elemMatch: { _id: userid } } })
            if (isExists) {
                data = await messageModel.findOneAndUpdate(
                    { roomId, "status._id": userid },
                    { $set: { "status.$.seen": date } },
                    { upsert: true, new: true }
                )
            } else {
                data = await messageModel.updateOne(
                    { roomId },
                    { $push: { status: { _id: userid, seen: date } } },
                    { upsert: true, new: true }
                )
            }
        }
        if (!data) {
            return res.status(400).json({ success: false, message: "room doesnt exists" })
        }

        let response = isRoomExists?.status
        if (data?.status) {
            response = data.status
        }
        io.emit("read-" + roomId, { data: response })
        return res.status(200).json({ success: true, data: response })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "server error" })
    }
}


const getTyping = async (req, res) => {
    const { roomId } = req.params
    const { userid } = req
    const { status } = req.body
    let data;
    const isExists = await messageModel.findOne({ roomId, status: { $elemMatch: { _id: userid } } })
    if (isExists) {
        data = await messageModel.findOneAndUpdate(
            { roomId, "status._id": userid },
            { $set: { "status.$.typing": status } },
            { upsert: true, new: true }
        )
    }
    if (!data) {
        return res.status(400).json({ success: false, message: "room and user in status doesnt exists" })
    }
    io.emit("typing-" + roomId, { data: data.status })
    return res.status(200).json({ success: true, data: data.status })
}

module.exports = {
    saveMessage,
    getMessages,
    getChats,
    setSeenStatus,
    getTyping
}