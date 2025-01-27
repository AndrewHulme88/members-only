require("dotenv").config();
const path = require("node:path");
const express = require("express");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const userRouter = require("./routes/userRoutes");
const messageRouter = require("./routes/messageRoutes");
const homeRouter = require("./routes/homeRoutes");
const PORT = process.env.PORT || 3000;
const app = express();
const bodyParser = require('body-parser');

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({ secret: "cats", resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use("/", homeRouter);
app.use("/users", userRouter);
app.use("/messages", messageRouter);

app.listen(PORT, () => console.log("App listening on port 3000"));
