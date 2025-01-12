const path = require("node:path");
const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const userRouter = require("./routes/user");
const PORT = 3000;

const pool = new Pool({ connectionString: "postgresql:andrew:mydb@localhost:5432/members_only_db" });

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false}));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use("/users", userRouter);

app.get("/", (req, res) => res.render("index"));

app.listen(PORT, () => console.log("App listening on port 3000"));
