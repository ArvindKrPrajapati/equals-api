const user = require("../modals/user.modal")
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs")


const signup = async (req, res) => {
    try {
        let { mobile, gender, name, password } = req.body
        if (!mobile && !gender && !name && !password) {
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
            if (!varify) {
                password = bcrypt.hashSync(password, 10);
                const newUser = await user.create({ mobile, gender, name, password })
                token = jwt.sign(JSON.stringify({ id: newUser._id, name: newUser.name }), process.env.JWT_SECRET);
                return res.status(200).json({ success: true, data: token })
            } else {
                return res.status(401).json({ success: false, message: "User already exists" })
            }
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

        const data = await user.findOne({ mobile })
        if (!data) {
            return res.status(500).json({ success: false, message: "user dont exist with this mobile number" })
        }
        if (!bcrypt.compareSync(password, data.password)) {
            return res.status(500).json({ success: false, message: "wrong password" })
        }
        const token = jwt.sign({ id: data._id, name: data.name }, process.env.JWT_SECRET);
        return res.status(200).json({ success: true, data: token })
    } catch (error) {
        return res.status(500).json({ success: false, message: "server error" })
    }
}
module.exports = {
    signup,
    login
}