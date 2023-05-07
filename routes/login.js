const express = require("express");
const Login = require("../models/Login.js");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        let body = req.body;
        let login = new Login();

        login.username = body.userName;
        login.password = body.password;

        await login.save();

        res.send({ Success: true, Message: "Regisatrtion successful" });
    } catch (err) {
        res.send({ Success: false, Message: err.message })
    }

});

router.post("/login", async (req, res) => {
    try {
        let body = req.body;
        let login = await Login.findOne({ username: body.userName, password: body.password });
        if (!login) {
            res.send({ Success: false, Message: "Invalid User" });
        } else {
            res.send({ Success: true, Message: "Valid User" });
        }

    } catch (err) {
        res.send({ Success: false, Message: err.message })
    }
});

module.exports = router;