const bcrypt = require("bcrypt");
const db = require("../util/database").db;

exports.getRegister = (req, res, next) => {
  res.render("register", {
    pageTitle: "Register",
    errorMessage: null,
    oldInput: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
};

exports.postRegister = async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const confirmPassword = req.body.passwordConfirm;

    if (password !== confirmPassword) {
      return res.status(422).render("register", {
        pageTitle: "Register",
        errorMessage: "Passwords don't match!",
        oldInput: {
          username: username,
          password: password,
          confirmPassword: confirmPassword,
        },
      });
    }

    const [rows] = await db.execute("SELECT * FROM USERS WHERE username=?", [
      username,
    ]);
    if (rows.length != 0) {
      return res.status(422).render("register", {
        pageTitle: "Register",
        errorMessage: "Already register username!",
        oldInput: {
          username: username,
          password: password,
          confirmPassword: confirmPassword,
        },
      });
    }

    const hashedPassw = await bcrypt.hash(password, 12);
    await db.execute("INSERT INTO USERS (username, password) VALUES (?,?)", [
      username,
      hashedPassw,
    ]);
    res.redirect("/login");
  } catch (err) {
    res.redirect("/error");
  }
};

exports.getLogin = (req, res, next) => {
  res.render("login", {
    pageTitle: "Login",
    errorMessage: null,
    oldInput: { username: "", password: "" },
  });
};

exports.postLogin = async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    
    let user;
    const [rows] = await db.execute("SELECT * FROM USERS");

    if (rows.length == 0) {
      return res.status(422).render("login", {
        pageTitle: "Login",
        errorMessage: "Incorrect data!",
        oldInput: {
          username: username,
          password: password,
        },
      });
    }

    user = rows[0];
    console.log(user)
    const doMatch = await bcrypt.compare(password, user.password);
    if (doMatch) {
      req.session.isLogged = true;
      req.session.user = user;
      await req.session.save();
      res.redirect("/");
    } else {
      return res.status(422).render("login", {
        pageTitle: "Login",
        errorMessage: "Incorrect data!",
        oldInput: {
          username: username,
          password: password,
        },
      });
    }
  } catch (err) {
    
    res.redirect("/error");
  }
};
