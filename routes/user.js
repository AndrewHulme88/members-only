const { Router } = require("express");
const userRouter = Router();

userRouter.get("/sign-up", (req, res) => res.render("sign-up-form"));

userRouter.post("/sign-up", async (req, res, next) => {
  try {
    await pool.query("INSERT INTO users (firstName, lastName, email, password) VALUES ($1, $2, $3, $4)", [
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.password,
    ]);
    res.redirect("/");
  } catch (err) {
    return next(err);
  }
});

module.exports = userRouter;
