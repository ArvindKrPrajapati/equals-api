const express = require("express")
const router = express.Router()
const { saveMessage, getMessages, getChats, setSeenStatus, getTyping } = require("../controllers/message.controller")

router.post("/", saveMessage)
router.get("/chats", getChats)
router.post("/typing/:roomId", getTyping)
router.patch("/status/:id", setSeenStatus)
router.get("/:id", getMessages)
module.exports = router