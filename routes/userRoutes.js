const { Router } = require("express");
const userRouter = Router();
const userController = require("../controllers/userController");

userRouter.get("/", userController.home);

userRouter.get("/sign-up", userController.signUpForm);
userRouter.post("/sign-up", userController.signUp);

userRouter.get("/login", userController.loginForm);
userRouter.post("/login", userController.login);

module.exports = userRouter;
