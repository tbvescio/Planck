const bcrypt = require("bcrypt");
const db = require("../util/database").db;

exports.getRegister = (req, res, next) => {
  res.render("register", {
    pageTitle: "Register",
    errorMessage: "",
    oldInput: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
};

exports.postRegister = (req, res, next) => {
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

  db.execute("SELECT * FROM USERS WHERE username=?", [username])
    .then((result) => {
      //if its registered already
      if (result[0].length != 0) {
        return res.status(422).render("register", {
          pageTitle: "Register",
          errorMessage: "Already register username!",
          oldInput: {
            username: username,
            password: password,
            confirmPassword: confirmPassword,
          },
        });
      } else {
        return bcrypt.hash(password, 12);
      }
    })
    .then((hashedPassw) => {
      return db.execute("INSERT INTO USERS (username, password) VALUES (?,?)", [
        username,
        hashedPassw,
      ]);
    })
    .then(() => res.redirect("/login"))
    .catch((err) => res.redirect("/error"));
};

exports.getLogin = (req, res, next) => {
  res.render("login", {
    pageTitle: "Login",
    errorMessage: "",
    oldInput: { username: "", password: "" },
  });
};

exports.postLogin = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  let user;

  db.execute("SELECT * FROM USERS WHERE username=?", [username])
    .then((result) => {
      if (result[0].length != 0) {
        user = result[0][0];
        return bcrypt.compare(password, result[0][0].password)
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
    })
    .then((doMatch) =>{
      if(doMatch){
        req.session.isLogged = true;
        req.session.user = user;
        return req.session.save(() => res.redirect("/"));
      }
      else{
        return res.status(422).render("login", {
          pageTitle: "Login",
          errorMessage: "Incorrect data!",
          oldInput: {
            username: username,
            password: password,
          },
        });
      }
    })
    .catch((err) => res.redirect("/error"));
};
