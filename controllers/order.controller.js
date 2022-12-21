const { io } = require("../app")
const orderModel = require("../models/order.model")

const getAllOrders = async (req, res) => {
    try {
        const data = await orderModel.find()
        return res.status(200).json({ success: true, data })
    } catch (error) {

        return res.status(500).json({ success: false, error: "server error" })
    }
}

const addOrder = async (req, res) => {
    try {
        await orderModel.create(req.body)
        const data = await orderModel.find()
        io.emit("order-added", data)
        return res.status(200).json({ success: true, data: { message: "added" } })
    } catch (error) {
        return res.status(500).json({ success: false, error: "server error" })
    }
}

module.exports = {
    getAllOrders,
    addOrder
}