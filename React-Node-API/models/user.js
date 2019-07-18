const mongoose = require("mongoose");
const uuidv1 = require('uuid/v1');
const crypto = require('crypto');
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: true
	},
	email: {
		type: String,
		trim: true,
		required: true
	},
	hashed_password: {
		type: String,
		required: true
	},
	salt: String,
	created: {
		type: Date,
		default: Date.now
	},
	updated: Date,
	photo: {
		data: Buffer,
		contentType: String
	},
	userBio: {
		type: String,
		trim: true
	},
	following: [{type: ObjectId, ref: "User"}],
	followers: [{ type: ObjectId, ref: "User" }],

	resetPasswordLink: {
		data: String,
		default: ""
	}
});

/** *   We are going to use Virtual Fields, Virtual fields are
additional /** *   field for a given model. 
*       Their values canbe set manually or automatically with defined 
		functionality
		Keep in mind: virtual properties don't get persisted in the database
		They only exist logically and are not written to the document's collection.

**/

// Virtual field
userSchema.virtual('password').set(function(password) {
	// create temporay variable callsed _password
	this._password = password;
	//generate a timestamp
	this.salt = uuidv1();
	// Encrypt the password
	this.hashed_password = this.encryptPassword(password)
}).get(function() {
	return this._password;
});


// method 
userSchema.methods = {

	authenticate: function(plainText) {
		return this.encryptPassword(plainText) === this.hashed_password;
	},

	encryptPassword: function(password) {
		if (!password) return "";
		try {
			return crypto
				.createHmac("sha1", this.salt)
				.update(password)
				.digest("hex");
		} catch (err) {
			return "";
		}
	}
};

module.exports = mongoose.model("User", userSchema);