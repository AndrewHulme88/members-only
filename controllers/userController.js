const passport = require("passport");
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { ResultWithContextImpl } = require("express-validator/lib/chain");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      console.log("Database query result:", rows);
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect email" });
      }

      const match = await bcrypt.compare(password, user.password);
      console.log("Password match result:", match);
      if (!match) {
        return done(null, false, { message: "Incorrect Password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = rows[0];

    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = {
  signUpForm: (req, res) => {
    res.render("sign-up-form", {
      user: { firstName: "", lastName: "", email: ""},
      errors: []
    });
  },

  signUp: [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
    body("password").isLength({ min:6 }).withMessage("Password must be at least 6 characters").matches(/\d/).withMessage("Password must contain a number"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),

    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.render("sign-up-form", {
          user: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
          },
          errors: errors.array()
        });
      }

      const { firstName, lastName, email, password } = req.body;
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
          "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)",
          [firstName, lastName, email, hashedPassword]
        );
        res.redirect("/users/login");
      } catch (err) {
        console.error("Error adding user", err);
        res.status(500).json({ error: "Failed to add user" });
      }
    },
  ],

  loginForm: (req, res) => {
    res.render("login");
  },

  login: (req, res, next) => {
    console.log("Received login data:", req.body);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }

      if (!user) {
        console.log("Authentication failed:", info?.message);
        return res.redirect("/users/login");
      }

      console.log("Authentication successful for user:", user);
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }

        console.log("User logged in successfully:", user);
        return res.redirect("/");
      });
    })(req, res, next);
  },

  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  },

  joinClubForm: (req, res) => {
    res.render("join-the-club");
  },

  joinClub: async (req, res) => {
    const { passcode } = req.body;
    const correctPasscode = process.env.SECRET_PASSCODE;

    if (passcode === correctPasscode) {
      try {
        await pool.query("UPDATE users SET membership_status = true WHERE id = $1", [req.user.id]);
        res.redirect("/");
      } catch (err) {
        console.error("Error updating membership status", err);
        res.status(500).json({ error: "Failed to update membership status" });
      }
    } else {
      res.render("join-the-club", { error: "Incorrect passcode. Please try again." });
    }
  },

  adminSignUpForm: (req, res) => {
    res.render("admin-signup-form");
  },

  adminSignUp: async (req, res) => {
    const { adminPasscode } = req.body;
    const correctAdminPasscode = process.env.SECRET_ADMIN_PASSCODE;

    if (adminPasscode === correctAdminPasscode) {
      try {
        await pool.query("UPDATE users SET admin = true WHERE id = $1", [req.user.id]);
        res.redirect("/");
      } catch (err) {
        console.error("Error updating admin status", err);
        res.status(500).json({ error: "Incorrect admin passcode. Please try again." });
      }
    } else {
      res.render("admin-signup-form", { error: "Incorrect admin passcode. Please try again." });
    }
  }
};
