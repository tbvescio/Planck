const bcrypt = require("bcrypt");
const db = require("../util/database").db;

exports.getRegister = (req, res) => {
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

exports.postRegister = async (req, res) => {
  const { username, password, passwordConfirm } = req.body;
  try {
    if (password !== passwordConfirm) {
      throw new Error("Passwords don't match!");
    }

    const [rows] = await db.execute("SELECT * FROM users WHERE username=?", [
      username,
    ]);
    if (rows.length != 0) {
      throw new Error("Username already register !");
    }

    const hashedPassw = await bcrypt.hash(password, 12);
    await db.execute("INSERT INTO users (username, password) VALUES (?,?)", [
      username,
      hashedPassw,
    ]);
    res.redirect("/login");
  } catch (err) {
    return res.status(422).render("register", {
      pageTitle: "Register",
      errorMessage: err.message,
      oldInput: {
        username: username,
        password: password,
        confirmPassword: passwordConfirm,
      },
    });
  }
};

exports.getLogin = (req, res) => {
  res.render("login", {
    pageTitle: "Login",
    errorMessage: null,
    oldInput: { username: "", password: "" },
  });
};

exports.postLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE username=?", [
      username,
    ]);
    if (rows.length == 0) {
      throw new Error("Incorrect data!");
    }

    let fechedUser = rows[0];
    const doMatch = await bcrypt.compare(password, fechedUser.password);
    if (doMatch) {
      req.session.isLogged = true;
      req.session.user = fechedUser;
      await req.session.save();
      res.redirect("/");
    } else {
      throw new Error("Incorrect data!");
    }
  } catch (err) {
    return res.status(422).render("login", {
      pageTitle: "Login",
      errorMessage: err.message,
      oldInput: {
        username: username,
        password: password,
      },
    });
  }
};
