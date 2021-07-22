const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const expressLayouts = require("express-ejs-layouts");
const connectDB = require("./config/db");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const config = require("config");
const db = config.get("mongoUri");
const flash = require("express-flash");
const passport = require("passport");
const sgMail = require("@sendgrid/mail");

const app = express();

// Database
connectDB();

// SGMail Api
sgMail.setApiKey(config.get("SENDGRID_API_KEY"));

// Session Configuration
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: db,
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours expiry date
  })
);

// Static Folder
app.use(express.static("public"));

// EJS
app.set("view engine", "ejs");
app.use(expressLayouts);

// Flash messages
app.use(flash());

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Passport Config
require("./config/passport")(passport);
// Passport Middlerware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", require("./routes/index"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/auth", require("./routes/auth"));

// Global Variable
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));
