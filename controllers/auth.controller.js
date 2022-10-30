const user = require("../modals/user.modal")
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const otpModal = require("../modals/otp.modal");

const springedge = require('springedge');

const signup = async (req, res) => {
    try {
        let { mobile, gender, name, password } = req.body
        if (!mobile || !gender || !name || !password) {
            return res.status(400).json({ success: false, message: "mobile, gender ,name ,password are required" })
        }
        if (isNaN(mobile)) {
            return res.status(400).json({ success: false, message: "invalid mobile number (NaN)" })
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "password must be greater than 7 digit" })
        }


        if (mobile.toString().length === 10) {
            const varify = await user.findOne({ mobile })
            if (varify) {
                if (varify.accountCreated) {
                    return res.status(401).json({ success: false, message: "User already exists" })
                } else {
                    // update
                    password = bcrypt.hashSync(password, 10);
                    const data = await user.findByIdAndUpdate(varify._id, { mobile, gender, name, password }, { new: true })
                    sendOtp(req, res, data, "updated")
                }
            } else {
                // create
                password = bcrypt.hashSync(password, 10);
                const data = await user.create({ mobile, gender, name, password })
                sendOtp(req, res, data, "created")
            }
            // if (!varify) {
            //     password = bcrypt.hashSync(password, 10);
            //     const newUser = await user.create({ mobile, gender, name, password })
            // } else {
            //     return res.status(401).json({ success: false, message: "User already exists" })
            // }
        } else {
            return res.status(400).json({ success: false, message: "invalid mobile number" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "server error" })
    }
}

const login = async (req, res) => {
    try {
        let { mobile, password } = req.body;
        if (!mobile || !password) {
            return res.status(400).json({ success: false, message: "mobile ,password are required" })
        }

        const data = await user.findOne({ mobile, accountCreated: true })
        if (!data) {
            return res.status(500).json({ success: false, message: "user dont exist with this mobile number" })
        }
        if (!bcrypt.compareSync(password, data.password)) {
            return res.status(500).json({ success: false, message: "wrong password" })
        }
        const token = jwt.sign({ id: data._id }, process.env.JWT_SECRET);
        return res.status(200).json({ success: true, data: { id: data._id, name: data.name, dp: data.dp }, token })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "server error" })
    }
}

const sendOtp = async (req, res, data, action) => {
    // create random otp
    const otp = Math.floor(100000 + Math.random() * 900000);
    // update in db
    const otpObj = await otpModal.updateOne({ mobile: data.mobile }, { otp, userid: data._id, mobile: data.mobile }, { upsert: true })
    // send
    const params = {
        'apikey': process.env.SPRINGE_EDGE_API_KEY, // API Key
        'sender': 'SEDEMO', // Sender Name
        'to': [
            '91' + data.mobile  //Moblie Number
        ],
        'message': `Mobile Number verification code is ${otp} Do not share it`,
        'format': 'json'
    };
    springedge.messages.send(params, 5000, function (err, response) {
        if (err) {
            return res.status(401).json({ success: false, message: err.error })
        }
        return res.status(200).json({ success: true, data: "otp send" })
    });
}

const varifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body
        if (!mobile || !otp) {
            return res.status(400).json({ success: false, message: "mobile and otp is required" })
        }
        if (isNaN(mobile)) {
            return res.status(400).json({ success: false, message: "invalid mobile number (NaN)" })
        }
        if (isNaN(otp)) {
            return res.status(400).json({ success: false, message: "invalid otp (NaN)" })
        }
        if (mobile.toString().length !== 10) {
            return res.status(400).json({ success: false, message: "Invalid mobile number (10 digit)" })
        }
        if (otp.toString().length !== 6) {
            return res.status(400).json({ success: false, message: "otp is invalid ( 6 digit otp)" })
        }
        const validOtp = await otpModal.findOne({ mobile, otp }).populate("userid")
        if (validOtp) {
            // send token
            await user.findByIdAndUpdate(validOtp.userid._id, { accountCreated: true })
            const token = jwt.sign({ id: validOtp.userid._id }, process.env.JWT_SECRET);
            return res.status(200).json({ success: true, data: { id: validOtp.userid._id, name: validOtp.userid.name, dp: validOtp.userid.dp }, token })
        }

        return res.status(400).json({ success: false, message: "wrong otp or mobile number" })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "server error" })
    }
}

module.exports = {
    signup,
    login,
    varifyOtp
}