const express = require("express")
const router = express.Router()
const { getLinks } = require("../controllers/youtube.controller")

router.get("/", getLinks);

module.exports = router