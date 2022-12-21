const express = require("express")
const router = express.Router()
const { saveMessage, getMessages, getChats } = require("../controllers/message.controller")

router.post("/", saveMessage)
router.get("/chats", getChats)
router.get("/:id", getMessages)
module.exports = router