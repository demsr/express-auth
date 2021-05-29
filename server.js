require("dotenv").config();
const express = require("express");
const app = express();
const helmet = require("helmet");
const flash = require("connect-flash");
/* Session stuff */
const session = require("express-session");
const Redis = require("ioredis");
const redis = new Redis();
let RedisStore = require("connect-redis")(session);

const apiRouter = require("./router/api");

/* Auth stuff */
const mdb = require("./db/MDB");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
passport.use(
  new LocalStrategy(function (username, password, done) {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }

      user.comparePassword(password, (err, isMatch) => {
        if (err) return done(null, false, { message: err });
        if (!isMatch)
          return done(null, false, {
            message: "Incorrect username or password",
          });

        return done(null, user);
      });
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
  // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
  User.findById(id, "-password", function (err, user) {
    done(err, user);
  });
});

app.set("view engine", "ejs");
app.use(express.json());
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.static("public"));

mdb.on("error", console.error.bind(console, "connection error:"));

app.use(
  session({
    store: new RedisStore({ client: redis }),
    saveUninitialized: false,
    unset: "destroy",
    secret: process.env.COOKIESECRET,
    resave: false,
    name: "keks",
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", apiRouter);

app.get("/", connectEnsureLogin.ensureLoggedIn("/login"), (req, res) => {
  console.log(req.user);
  res.render("pages/account", { user: req.user });
});
app.get("/login", (req, res) => {
  res.render("pages/login", {
    messages: req.flash("error"),
  });
});
app.get("/register", (req, res) => {
  res.render("pages/register", {
    messages: req.flash("error"),
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/register", (req, res) => {
  console.log("Body: ", req.body);

  User.find({ username: req.body.username }, (err, users) => {
    if (err) {
      req.flash("error", "unknown error");
      return res.redirect("/register");
    }
    if (users.length > 0) {
      req.flash("error", "username already in unse");
      return res.redirect("/register");
    }

    User({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
    }).save((err, user) => {
      if (err) res.redirect("/register");
      res.redirect("/login");
    });
  });
});

mdb.once("open", function () {
  app.listen(process.env.PORT, () => {
    console.log(`App listening at http://localhost:${process.env.PORT}`);
  });
});
