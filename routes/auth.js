const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { ensureGuest, isNotVerified } = require("../middlewares/auth");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");

router.get("/register", ensureGuest, (req, res) => {
  res.render("register", {
    isLoggedIn: false,
  });
});

router.post("/register", async (req, res, next) => {
  const { email, username, password } = req.body;
  console.log(email, username, password);

  // Check if email already exists
  User.exists({ email: email }, (err, result) => {
    if (result) {
      req.flash("error", "Email Already Registered, Kindly Login");
      res.redirect("/auth/login");
    }
  });

  let newUser = new User({
    username,
    email,
    password,
    emailToken: crypto.randomBytes(256).toString("hex"),
    isVerified: false,
  });
  const msg = {
    from: "lavishgoyal1301@gmail.com", // Use the email address or domain you verified above
    to: newUser.email,
    subject: "Verify Your Email",
    text: `
      Hello, thanks for registration on our website.
      Please copy and paste the adress below in your browser to verify your account.
      Your username is: ${newUser.username}
      http://${req.headers.host}/auth/verify-email?token=${newUser.emailToken}
    `,
    html: `
      <h1>Hello,</h1>
      <p>thanks for registration on our site. Kindly click the below link to complete your registration.</p>
      <p>Your username is: ${newUser.username}</p>
      <a href="http://${req.headers.host}/auth/verify-email?token=${newUser.emailToken}">Verify Your Account</a>
    `,
  };

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        console.log(err);
      }
      newUser.password = hash;
      newUser.save(async (err, user) => {
        if (err) {
          console.log(err);
          console.log(user);
        } else {
          try {
            await sgMail.send(msg);
            console.log("Mail sent");
            req.flash(
              "success",
              "You are now registered, please verify via the link in your email"
            );
            res.redirect("/auth/login");
          } catch (err) {
            console.log(err);
            req.flash(
              "error",
              "If you haven't recieved the link kindly register again."
            );
            res.redirect("/auth/register");
          }
        }
      });
    });
  });
});

router.get("/verify-email", async (req, res, next) => {
  try {
    const user = User.findOne({ emailToken: req.query.token });
    if (!user) {
      req.flash("error", "Token is invalid. Please contact us for assistance");
      return res.redirect("/");
    }
    await User.findOneAndUpdate(
      { emailToken: req.query.token },
      { $set: { emailToken: null, isVerified: true } },
      (err) => {
        console.log("registration done");
        console.log(err);
        req.flash(
          "success",
          "You have successfully verified your account, Kindly login"
        );
        res.redirect("/auth/login");
      }
    );
  } catch (err) {
    console.log(err);
    req.flash("err", "Something went wrong.");
    res.redirect("/");
  }
});

router.get("/login", ensureGuest, (req, res) => {
  res.render("login", {
    isLoggedIn: false,
  });
});

router.post("/login", isNotVerified, (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
