exports.createPostValidator = (req, res, next) => {
	//title
	req.check('title', "Title is Required").notEmpty()
	req.check("title", "Title must be between 4 and 150 Characters").isLength({
		min: 4,
		max: 150
	});
	//body
	req.check('body', "Body Content is Required").notEmpty()
	req.check('body', "Body must be between 4 and 2000 Characters").isLength({
		min: 4,
		max: 2000
	});

	//check for errors
	const errors = req.validationErrors();

	//show errors in order they happen
	if (errors) {
		const firstError = errors.map((error) => error.msg)[0]
		return res.status(400).json({ error: firstError });
	}

	//proceed to middleware
	next();
};

exports.userSignupValidator = (req, res, next) => {
	//name is required and should be between 4-10 characters
	req.check("name", "Name is Required and must be between 4-10 characters").notEmpty();

	// email is required, must be valid format
	req.check("email", "Email is Required and must be between 3 to 32 Characters")
	.matches(/.+\@.+\..+/)
	.withMessage("Email must be valid format")
	.isLength({
			min: 4,
			max: 50
		})
	// password match check
	req.check("password", "Password is Required").notEmpty();
	req.check("password")
	.isLength({ min: 6 })
	.withMessage("Password must contain at least 6 characters")
	.matches(/\d/)
	.withMessage("Password Must contain at least a number")


	//check for errors
	const errors = req.validationErrors();

	//show errors in order they happen
	if (errors) {
		const firstError = errors.map((error) => error.msg)[0]
		return res.status(400).json({ error: firstError });
	}

	//proceed to middleware
	next();

};



exports.passwordResetValidator = (req, res, next) => {
	// check for password
	req.check("newPassword", "Password is required").notEmpty();
	req.check("newPassword")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 chars long")
		.matches(/\d/)
		.withMessage("must contain a number")
		.withMessage("Password must contain a number");

	// check for errors
	const errors = req.validationErrors();
	// if error show the first one as they happen
	if (errors) {
		const firstError = errors.map(error => error.msg)[0];
		return res.status(400).json({ error: firstError });
	}
	// proceed to next middleware or ...
	next();
};





