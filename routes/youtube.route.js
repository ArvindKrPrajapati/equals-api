const express = require("express")
const router = express.Router()
const { getLinks } = require("../controllers/youtube.controller")

router.post("/", getLinks);

module.exports = router