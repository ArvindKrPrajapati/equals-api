const ytdl = require("ytdl-core");

const getLinks = async (req, res) => {
    try {
        let { url } = req.body
        const v_id = url.split('v=')[1];
        if (!url) {
            return res.status(400).json({ success: false, message: "url is required" })
        }

        let data = await ytdl.getInfo(url);
        return res.status(200).json({ success: true, data: data.formats })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "server error" })
    }
}

module.exports = {
    getLinks
}