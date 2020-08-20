const db = require("../util/database").db;
require("dotenv").config();

exports.getAddUrl = (req, res, next) => {
  res.render("add-url", {
    pageTitle: "Short Url",
    user: req.session.user,
    domain: process.env.DOMAIN
  });
};

exports.postAddUrl = async (req, res, next) => {
  try {
    const url = req.body.url;
    const idUser =
      req.session.user == undefined
        ? null
        : req.session.user.idUSERS.toString();

    if (!url) {
      return res.render("add-url", {
        pageTitle: "UrlShorter",
        user: req.session.user,
        errorMessage: "Enter an url",
      });
    }

    //Check if the url is already in the db
    const [fetchedUrl] = await db.execute("SELECT * FROM URLs WHERE url=?", [url]);
    if (fetchedUrl.length > 0) {
      return res.render("add-url", {
        pageTitle: "UrlShorter",
        user: req.session.user,
        errorMessage: "Url is already shorted",
      });
    }

    const [lastId] = await db.execute("SELECT max(idURLs) as n FROM URLs");
    let nextId = lastId[0].n + 1;

    let buff = Buffer.from(nextId.toString());
    let urlConverted = buff.toString("base64");
    await db.execute(
      "INSERT INTO URLs (url, urlConverted, idUser) VALUES (?,?,?)",
      [url, urlConverted, idUser]
    );
    res.render("add-url", {
      pageTitle: "UrlShorter",
      url: urlConverted,
      user: req.session.user,
      domain: process.env.DOMAIN
    });
  } catch (err) {
    res.redirect("/error");
  }
};

exports.getRedirect = async (req, res, next) => {
  try {
    //decode the url from base64
    const encodedUrl = req.params.url;
    let binaryData = Buffer.from(encodedUrl, "base64");
    let decoded = binaryData.toString("utf8");

    let url;

    const [fetchedUrl] = await db.execute("SELECT url, idUser FROM URLs WHERE idURLs=?", [decoded]);

    //there is no url found
    if (fetchedUrl.length == 0) {
      res.redirect("/error");
    }

    url = fetchedUrl[0].url;
    idUser = fetchedUrl[0].idUser;
    if (idUser != null) {
      await db.execute(
        "INSERT INTO CLICKS_LOG (idURL, browser, os) VALUES (?,?,?)",
        [decoded, req.useragent["browser"], req.useragent["platform"]]
      );
    }
    res.status(301).redirect(url);
  } catch (err) {
    res.redirect("/error");
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    if (req.session.user == undefined) {
      return res.redirect("/login");
    }
    const idUser = req.session.user.idUSERS;
    const [urls] = await db.execute("SELECT idURLs, url, urlConverted FROM URLs WHERE idUser=?",[idUser]);
    res.render("analytics", {
      pageTitle: "Analytics",
      ids: urls,
      user: req.session.user,
      domain: process.env.DOMAIN
    });
  } catch (err) {
    res.redirect("/error");
  }
};

exports.getAnalyticsById = async (req, res, next) => {
  try{
    if (req.session.user == undefined) {
      return res.redirect("/login");
    }
    const idURL = req.params.idURL;
    const [clicks] = await db.execute("SELECT * FROM CLICKS_LOG WHERE idURL=?", [idURL]);
    totalClicks = clicks.length;
    
    //BROWSER DATA
    let dataBrowser = [];
    let labelsBrowser = [];

    for (let index = 0; index < totalClicks; index++) {
      const elementBrowser = { x: clicks[index].browser, y: 1 };
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
    
    for (let index = 0; index < totalClicks; index++) {
      const elementOs = { x: clicks[index].os, y: 1 };
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
        pageTitle: "Analytics!",
        dataBrowser: JSON.stringify(dataBrowser),
        labelsBrowser: JSON.stringify(labelsBrowser),
        dataOs: JSON.stringify(dataOs),
        lablesOs: JSON.stringify(lablesOs),
        totalClicks: totalClicks,
        user: req.session.user,
      });
    }catch (err) {
      res.redirect("/error");
    }
  };
  
  exports.getLogout = (req, res, next) => {
    req.session.user = undefined;
    res.redirect("/login");
  };
  
  exports.getError = (req, res, next) => {
    res.render("error", {
      pageTitle: "Error",
    });
  };
  