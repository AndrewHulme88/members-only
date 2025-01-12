const { Router } = require("express");
const userRouter = Router();
const userController = require("../controllers/userController");
const passport = require("passport");

userRouter.get("/sign-up", (req, res) => res.render("sign-up-form"));
userRouter.post("/sign-up", userController.signUp);

userRouter.get("/login", (req, res) => res.render("login"));
userRouter.post("/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);

module.exports = userRouter;
