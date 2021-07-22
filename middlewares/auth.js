const User = require("../models/User");

module.exports = {
  ensureAuth: (req, res, next) => {
    if (req.isAuthenticated()) {
      req.isLogged = true;
      return next();
    } else {
      req.isLogged = false;
      req.flash("error", "Please Login to access dashboard");
      res.redirect("/auth/login");
    }
  },

  ensureGuest: (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.isLogged = false;
      return next();
    } else {
      req.isLogged = true;
      req.flash("user", "Welcome back!");
      res.redirect("/dashboard");
    }
  },

  isNotVerified: async (req, res, next) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (user.isVerified) {
        return next();
      }
      req.flash(
        "error",
        "Your account has not been verified, Please check your email"
      );
      res.redirect("/auth/login");
    } catch (err) {
      console.log(err);
    }
  },
};
