const express = require("express")
const router = express.Router()
const { getAllOrders, addOrder } = require("../controllers/order.controller")

router.route("/").get(getAllOrders).post(addOrder)

module.exports = router