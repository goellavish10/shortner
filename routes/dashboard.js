const express = require("express");
const router = express.Router();
const base62 = require("base62-random");
const baseUrl = "http://localhost:3000/";
const ShortUrl = require("../models/ShortUrl");
const validUrl = require("valid-url");
const { ensureAuth } = require("../middlewares/auth");

router.get("/", ensureAuth, async (req, res) => {
  const urls = await ShortUrl.find({ userId: req.user._id });

  // console.log(urls);
  // console.log(`${baseUrl}r/${urls[0].shortUrl}`);

  res.render("dashboard/dashboard", {
    userName: req.user.username,
    isLoggedIn: req.isLogged,
    urls,
  });
});

router.post("/", ensureAuth, async (req, res) => {
  let { longUrl, customName, title } = req.body;
  if (!validUrl.isUri(longUrl)) {
    req.flash("error", "Enter a valid URL!!!");
    return res.redirect("/dashboard");
  }
  try {
    if (customName) {
      customName = customName.replace(/\s/g, "");
      console.log(customName);
      let message = `Your tiny link is <a href="${longUrl}" target="_blank">${baseUrl}r/${customName}</a>`;
      await ShortUrl.create({
        longUrl,
        shortUrl: customName,
        name: title,
        userId: req.user._id,
      });
      req.flash("success", message);
      req.flash("code", customName);
      return res.redirect("/dashboard");
    } else {
      const url = await ShortUrl.findOne({ longUrl });
      if (url) {
        let message = `Your tiny link is <a href="${longUrl}" target="_blank">${baseUrl}r/${url.shortUrl}</a>`;
        req.flash("success", message);
        req.flash("code", url.shortUrl);
        return res.redirect("/dashboard");
      } else {
        let tinyUrl = base62(7);
        let message = `Your tiny link is <a href="${longUrl}" target="_blank">${baseUrl}r/${tinyUrl}</a>`;
        await ShortUrl.create({
          longUrl,
          shortUrl: tinyUrl,
          name: title,
        });
        req.flash("success", message);
        req.flash("code", tinyUrl);
        return res.redirect("/dashboard");
      }
    }
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong! Kindly submit the form again");
    res.redirect("/dashboard");
  }
});

// router.delete("/:shorturl", ensureAuth, async (req, res) => {
//   try {
//     let url = await ShortUrl.findOne({ shortUrl: req.params.shorturl });

//     if (url.userId != req.user.id) {
//       req.flash("error", "Not Authorized");
//       res.redirect("/dashboard");
//     } else {
//       await ShortUrl.deleteOne({ shortUrl: req.params.shorturl });
//       req.flash("delete", "Link removed");
//       res.redirect("/dashboard");
//     }
//   } catch (err) {
//     console.error(err);
//     req.flash("error", err);
//     return res.redirect("/dashboard");
//   }
// });

router.get("/delete/:id", async (req, res) => {
  try {
    let linkToBeDelted = req.params.id;
    let url = await ShortUrl.findOne({ _id: linkToBeDelted });
    if (url.userId != req.user.id) {
      req.flash("error", "Not Authorized");
      res.redirect("/dashboard");
    } else {
      await ShortUrl.deleteOne({ _id: linkToBeDelted });
      req.flash("delete", "Link removed");
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    req.flash("error", err);
    return res.redirect("/dashboard");
  }
});

module.exports = router;
