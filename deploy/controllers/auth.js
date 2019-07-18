const _ = require("lodash");
const { sendEmail } = require("../helpers");
// load env
const dotenv = require("dotenv");
dotenv.config();


const jwt = require("jsonwebtoken");
require('dotenv').config();
const expressJwt = require('express-jwt');
const User = require('../models/user');


exports.signup = async (req, res) => {
	const userExists = await User.findOne({ email: req.body.email });
	if (userExists) return res.status(403).json({
		error: "Email is Already Taken! Please use a different Email!!"
	});
	const user = await new User(req.body);
	await user.save();
	res.status(200).json({ message: "SignUp Successful, Please Login to view your Profile!!" });
};

exports.signin = (req, res) => {
	// Check if user Exist based on Email ID
	const { email, password } = req.body;
	User.findOne({ email }, (err, user) => {
		// if error or no user
		if (err || !user) {
			return res.status(401).json({
				error: "User with this Email does not exist.. Please verify your email ID and login."
			});
		}
		// if user is found, verify that email and password matches
		// create authentication method in model and use it here
		if (!user.authenticate(password)) {
			return res.status(401).json({
				error: "Email and Password do not match, Please try again Later!!!."
			});
		}

		// Generate token for user id and secret
		const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);

		// persist the token as 'k' in cookie with expiry date
		res.cookie("k", token, { expire: new Date() + 3600 });

		// return response with user and token to frontend client
		const { _id, name, email, role } = user;
		return res.json({ token, user: { _id, email, name, role } });
	});

};

exports.signout = (req, res) => {
	res.clearCookie("k");
	return res.json({ message: "You've Signed Out Successfully!!!" });
};

exports.requireSignin = expressJwt({
	// if token is valid, express jwt appends the verified user's id
	// in an auth key to the request object
	secret: process.env.JWT_SECRET,
	userProperty: "auth"
});

// add forgotPassword and resetPassword methods
exports.forgotPassword = (req, res) => {
    if (!req.body) return res.status(400).json({ message: "No Email Sent" });
    if (!req.body.email)
        return res.status(400).json({ message: "Email Field cannot be empty" });

    console.log("forgot password finding user with that email");
    const { email } = req.body;
    console.log("signin req.body", email);
    // find the user based on email
    User.findOne({ email }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status("401").json({
                error: "User with that email does not exist!"
            });

        // generate a token with user id and secret
        const token = jwt.sign(
            { _id: user._id, iss: "NODEAPI" },
            process.env.JWT_SECRET
        );

        // email data
        const emailData = {
            from: "noreply@node-react.com",
            to: email,
            subject: "Password Reset Instructions",
            text: `Please use the following link below to reset your password: ${
                process.env.CLIENT_URL
                }/reset-password/${token}`,
            html: `<p>Please use the following link to reset your password:</p> <p>${
                process.env.CLIENT_URL
                }/reset-password/${token}</p>`
        };

        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.json({ message: err });
            } else {
                sendEmail(emailData);
                return res.status(200).json({
                    message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
                });
            }
        });
    });
};

// to allow user to reset password
// first you will find the user in the database with user's resetPasswordLink
// user model's resetPasswordLink's value must match the token
// if the user's resetPasswordLink(token) matches the incoming req.body.resetPasswordLink(token)
// then we got the right user

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    User.findOne({ resetPasswordLink }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status("401").json({
                error: "Invalid Link!"
            });

        const updatedFields = {
            password: newPassword,
            resetPasswordLink: ""
        };

        user = _.extend(user, updatedFields);
        user.updated = Date.now();

        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json({
                message: `Success! Password has been Successfully Reset, Please Login with your new Password.`
            });
        });
    });
};


exports.socialLogin = (req, res) => {
    // try signup by finding user with req.email
    let user = User.findOne({ email: req.body.email }, (err, user) => {
        if (err || !user) {
            // create a new user and login
            user = new User(req.body);
            req.profile = user;
            user.save();
            // generate a token with user id and secret
            const token = jwt.sign(
                { _id: user._id, iss: "NODEAPI" },
                process.env.JWT_SECRET
            );
            res.cookie("k", token, { expire: new Date() + 9999 });
            // return response with user and token to frontend client
            const { _id, name, email } = user;
            return res.json({ token, user: { _id, name, email } });
        } else {
            // update existing user with new social info and login
            req.profile = user;
            user = _.extend(user, req.body);
            user.updated = Date.now();
            user.save();
            // generate a token with user id and secret
            const token = jwt.sign(
                { _id: user._id, iss: "NODEAPI" },
                process.env.JWT_SECRET
            );
            res.cookie("k", token, { expire: new Date() + 9999 });
            // return response with user and token to frontend client
            const { _id, name, email } = user;
            return res.json({ token, user: { _id, name, email } });
        }
    });
};





