const follow = require("../modals/follow.modal")
const mongoose = require('mongoose');

const doFollow = async (req, res) => {
  try {
    let { action, to } = req.body
    if (!to) {
      return res.status(404).json({ success: false, message: "to id is not provided" })
    }
    if (!action) {
      return res.status(404).json({ success: false, message: "action is not provided" })
    }

    if (mongoose.Types.ObjectId.isValid(to)) {
      to = mongoose.Types.ObjectId(to)
      if (action === "follow") {
        const q={ to, by: req.userid }
        const data = await follow.findOneAndUpdate(q,q,{upsert:true})
        return res.status(200).json({ success: true, data: 'followed' })
      }
      if(action==="unfollow"){
        const data = await follow.findOneAndDelete({ to, by: req.userid })
        return res.status(200).json({ success: true, data: 'unfollowed' })
      }
      return res.status(200).json({ success: false, data: 'action should be follow or unfollow' })

    } else {
      return res.status(401).json({ success: false, message: "invalid id" })
    }

  } catch (e) {
    return res.status(500).json({ success: false, message: "server error" })
  }
}

module.exports = {
  doFollow
}