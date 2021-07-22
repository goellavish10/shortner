const express = require("express");
const router = express.Router();
const base62 = require("base62-random");
const baseUrl = "http://localhost:3000/";
const ShortUrl = require("../models/ShortUrl");
const validUrl = require("valid-url");
const { ensureGuest } = require("../middlewares/auth");

router.get("/", ensureGuest, (req, res) => {
  res.render("homepage", {
    isLoggedIn: false,
  });
});

router.post("/", ensureGuest, async (req, res) => {
  const { longUrl } = req.body;

  if (!validUrl.isUri(longUrl)) {
    req.flash("error", "Please enter a valid URL!!!");
    res.redirect("/");
  }

  try {
    const url = await ShortUrl.find({ longUrl });

    console.log(url);

    if (url.length > 0) {
      console.log("REACHED");
      let nonCustomUrl;
      url.forEach((e) => {
        if (!e.userId) {
          nonCustomUrl = e;
          // console.log(nonCustomUrl);
        }
      });
      if (nonCustomUrl) {
        let message = `Your tiny link is <a href="${longUrl}" target="_blank">${baseUrl}r/${nonCustomUrl.shortUrl}</a>`;
        req.flash("success", message);
        req.flash("code", nonCustomUrl.shortUrl);
        return res.redirect("/");
      }
    } else {
      console.log("REACHED");
      let tinyUrl = base62(7);
      let message = `Your tiny link is <a href="${longUrl}" target="_blank">${baseUrl}r/${tinyUrl}</a>`;
      await ShortUrl.create({
        longUrl,
        shortUrl: tinyUrl,
      });
      req.flash("success", message);
      req.flash("code", tinyUrl);
      return res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong try again");
    res.redirect("/");
  }
});

router.get("/r/:code", async (req, res) => {
  try {
    const url = await ShortUrl.findOne({ shortUrl: req.params.code });
    console.log(url);
    res.redirect(url.longUrl);
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

module.exports = router;
