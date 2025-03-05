const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserModel = require("../models/user-model");
const { forwardAuthenticated } = require("../middleware/auth");

router.get("/register", forwardAuthenticated, (req, res) => {
  res.render("auth/register");
});

router.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;
  const errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("auth/register", { errors, name, email });
  } else {
    try {
      const existingUser = await UserModel.findUserByEmail(email);
      if (existingUser) {
        errors.push({ msg: "Email already exists" });
        res.render("auth/register", { errors, name, email });
      } else {
        await UserModel.createUser({ name, email, password });
        req.flash("success_msg", "You are now registered and can log in");
        res.redirect("/login");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
});

router.get("/login", forwardAuthenticated, (req, res) => {
  res.render("auth/login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
  });
});

module.exports = router;
