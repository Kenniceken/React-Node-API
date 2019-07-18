const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
const expressValidator = require("express-validator");
const fs = require("fs");
const cors = require("cors");

const dotenv = require("dotenv");

dotenv.config();


// mongodb
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
	.then(() => console.log("MongoDB Connected Successfully!!!"));

mongoose.connection.on('error', err => {
	console.log(`MongoDB Connection Error: ${err.message}`);
});

//import routes
const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

// apiReadMe
app.get('/api', (req, res) => {
	fs.readFile('docs/apiReadMe.json', (err, data) => {
		if (err) {
			res.status(400).json({
				error: err
			});
		}
		const docs = JSON.parse(data);
		res.json(docs);
	});
});

// middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
app.use("/api", postRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use(function(err, req, res, next) {
	if (err.name === 'UnauthorizedError') {
		res.status(401).json({ error: "You do not have the right Authorization to perform this action!!!, Please Login" });
	}
});




const port = process.env.PORT || 8080;



app.listen(port, () => {
	console.log(`Your API server is Listening on Port: ${port}`)
});