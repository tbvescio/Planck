const db = require("../util/database").db;

exports.getHome = (req, res, next) => {
  res.render("home", {
    pageTitle: "Home",
    user: req.session.user
  });
};

exports.getAddUrl = (req, res, next) => {
  res.render("add-url", {
    pageTitle: "Short Url",
    user: req.session.user,
  });
};

exports.postAddUrl = (req, res, next) => {
  const url = req.body.url;
  const idUser =
    req.session.user == undefined ? null : req.session.user.idUser.toString();

  if (!url){
    return res.render("add-url", {
      pageTitle: "UrlShorter",
      user: req.session.user,
      errorMessage: "Enter an url"
    });
  }

  let urlConverted;
  db.execute("SELECT max(idURLs) as n FROM URLs")
    .then((lastId) => {
      let nextId = lastId[0][0].n + 1;

      let buff = Buffer.from(nextId.toString());
      urlConverted = buff.toString("base64");

      return db.execute(
        "INSERT INTO URLs (url, urlConverted, idUser) VALUES (?,?,?)",
        [url, urlConverted, idUser]
      );
    })
    .then(() => {
      res.render("add-url", {
        pageTitle: "UrlShorter",
        url: urlConverted,
        user: req.session.user
      });
    })
    .catch((err) => res.redirect("/error"));
};

exports.getRedirect = (req, res, next) => {
  const encodedUrl = req.params.url;
  let binaryData = Buffer.from(encodedUrl, "base64");
  let decoded = binaryData.toString("utf8");

  let url;
  db.execute("SELECT url, idUser FROM URLs WHERE idURLs=?", [decoded])
    .then((result) => {
      if (!result[0]) {
        res.redirect("/");
      }

      url = result[0][0].url;
      idUser = result[0][0].idUser;
      if (idUser != null) {
        return db.execute(
          "INSERT INTO CLICKS_LOG (idURL, browser, os) VALUES (?,?,?)",
          [decoded, req.useragent["browser"], req.useragent["platform"]]
        );
      }
      return;
    })
    .then(() => {
      res.status(301).redirect(url);
    })
    .catch((err) => res.redirect("/error"));
};

exports.getAnalytics = (req, res, next) => {
  if (req.session.user == undefined) {
    return res.redirect("/login");
  }

  const idUser = req.session.user.idUser;

  db.execute("SELECT idURLs, url, urlConverted FROM URLs WHERE idUser=?", [
    idUser,
  ])
    .then((idUrls) => {
      res.render("analytics", {
        pageTitle: "Analytics",
        ids: idUrls[0],
        user: req.session.user,
      });
    })
    .catch((err) => res.redirect("/error"));
};

exports.getAnalyticsById = (req, res, next) => {
  if (req.session.user == undefined) {
    return res.redirect("/login");
  }

  const idURL = req.params.idURL;

  db.execute("SELECT * FROM CLICKS_LOG WHERE idURL=?", [idURL])
    .then((result) => {
      result = result[0];

      const totalClicks = result.length;

      //BROWSER DATA
      let dataBrowser = [];
      let labelsBrowser = [];

      for (let index = 0; index < result.length; index++) {
        const elementBrowser = { x: result[index].browser, y: 1 };
        let found = false;

        for (let x = 0; x < dataBrowser.length; x++) {
          if (dataBrowser[x].x === elementBrowser.x) {
            dataBrowser[x].y += 1;
            found = true;
          }
        }
        if (!found) {
          dataBrowser.push(elementBrowser);
        }
      }

      for (let index = 0; index < dataBrowser.length; index++) {
        labelsBrowser.push(dataBrowser[index].x);
      }

      //OS DATA
      let dataOs = [];
      let lablesOs = [];

      for (let index = 0; index < result.length; index++) {
        const elementOs = { x: result[index].os, y: 1 };
        let found = false;

        for (let x = 0; x < dataOs.length; x++) {
          if (dataOs[x].x === elementOs.x) {
            dataOs[x].y += 1;
            found = true;
          }
        }
        if (!found) {
          dataOs.push(elementOs);
        }
      }

      for (let index = 0; index < dataOs.length; index++) {
        lablesOs.push(dataOs[index].x);
      }

      res.render("analyticsById", {
        pageTitle: "Analytics",
        dataBrowser: JSON.stringify(dataBrowser),
        labelsBrowser: JSON.stringify(labelsBrowser),
        dataOs: JSON.stringify(dataOs),
        lablesOs: JSON.stringify(lablesOs),
        totalClicks: totalClicks,
        user: req.session.user,
      });
    })
    .catch((err) => res.redirect("/error"));
};

exports.getLogout = (req, res, next) => {
  req.session.user = undefined;
  res.redirect("/login");
};


exports.getError = (req, res, next) => {
  res.render("error", {
    pageTitle: "Error"
  });
};