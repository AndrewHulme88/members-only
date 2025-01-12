const { Router } = require("express");
const userRouter = Router();
const userController = require("../controllers/userController");

userRouter.get("/sign-up", (req, res) => res.render("sign-up-form"));

userRouter.post("/sign-up", userController.signUp);


module.exports = userRouter;
