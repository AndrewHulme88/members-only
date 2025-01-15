const { Router } = require("express");
const userRouter = Router();
const userController = require("../controllers/userController");

userRouter.get("/sign-up", userController.signUpForm);
userRouter.post("/sign-up", userController.signUp);

userRouter.get("/login", userController.loginForm);
userRouter.post("/login", userController.login);

userRouter.post("/logout", userController.logout);

userRouter.get("/join-club", userController.joinClubForm);
userRouter.post("/join-club", userController.joinClub);

userRouter.get("/admin-signup", userController.adminSignUpForm);
userRouter.post("/admin-signup", userController.adminSignUp);

module.exports = userRouter;
