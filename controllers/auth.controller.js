const otps = require('../modals/otp.modal')
const user = require("../modals/user.modal")
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const bcrypt=require("bcryptjs")

const sendOtp = async (req, res) => {
    try {
        const { mobile } = req.body
        if (!mobile) {
            return res.status(400).json({ success: false, message: "mobile number is required" })
        }
        if (isNaN(mobile)) {
            return res.status(400).json({ success: false, message: "invalid number (NaN)" })
        }
        if (mobile.toString().length === 10) {
            const user_exists = await user.findOne({ mobile })
            if (user_exists) {
                return res.status(200).json({ success: false,  message: "user already exists"  })
            }
            const otp = Math.floor(100000 + Math.random() * 900000);
            const query = { mobile };
            const update = { mobile, otp };
            const options = { upsert: true, new: true };

            const data = await otps.findOneAndUpdate(query, update, options);

            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const myTwilioNumber = process.env.TWILIO_NUMBER

            const client = twilio(accountSid, authToken);

            client.messages
                .create({
                    body: 'welcome to shorts \n your otp varification code is ' + otp,
                    to: '+91' + mobile,
                    from: myTwilioNumber,
                })
                .then((message) => {
                    return res.status(200).json({ success: true, data: { message: "otp send to " + mobile + " number" } })
                })
                .catch((err) => {
                    return res.status(400).json({ success: false,  message: "otp sent failed"  })
                });
        } else {
            return res.status(400).json({ success: false, message: "invalid number" })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "server error" })
    }
}

const variefyOtpAndCreate = async (req, res) => {
    try {
        let { mobile, otp,name,password } = req.body
        if (!mobile && !otp && !name && !password) {
            return res.status(400).json({ success: false, message: "mobile, otp ,name ,password are required" })
        }
        if (isNaN(mobile) && isNaN(otp)) {
            return res.status(400).json({ success: false, message: "invalid number and otp (NaN)" })
        }

        if (mobile.toString().length === 10 && otp.toString().length === 6) {
            const varify = await otps.findOne({ mobile, otp })
            if (varify) {
                password=bcrypt.hashSync(password,10);
                const newUser = await user.create({ mobile, name,password })
                token = jwt.sign(JSON.stringify({ _id: newUser._id, name: newUser.name }), process.env.JWT_SECRET);

                await otps.findOneAndDelete({ mobile })
                return res.status(200).json({ success: true, data: token })
            } else {
                return res.status(401).json({ success: false, message: "wrong otp" })
            }
        } else {
            return res.status(400).json({ success: false, message: "invalid number or otp" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "server error" })
    }
}

module.exports = {
    sendOtp,
    variefyOtpAndCreate
}