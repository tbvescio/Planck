const db = require("../util/database").db;

exports.getHome = (req, res, next) => {
  res.render("home", {
    pageTitle: "Planck",
    user: req.session.user,
    domain: process.env.DOMAIN,
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
      throw new Error("Please enter an url before submitting.");
    }

    //Check if the url is already in the db
    const [fetchedUrl] = await db.execute("SELECT * FROM urls WHERE url=?", [
      url,
    ]);
    if (fetchedUrl.length > 0) {
      throw new Error("Url is already shorted");
    }

    const [lastId] = await db.execute("SELECT max(idURLs) as n FROM urls");
    let nextId = lastId[0].n + 1;

    //Convert nextId to base64
    let buff = Buffer.from(nextId.toString());
    let urlConverted = buff.toString("base64");

    await db.execute(
      "INSERT INTO urls (idURLs,url, urlConverted, idUser, createdAt) VALUES (?,?,?,?,?)",
      [nextId, url, urlConverted, idUser, new Date()]
    );

    res.render("home", {
      pageTitle: "UrlShorter",
      url: urlConverted,
      user: req.session.user,
      domain: process.env.DOMAIN,
    });
  } catch (err) {
    return res.render("home", {
      pageTitle: "UrlShorter",
      user: req.session.user,
      errorMessage: err.message,
    });
  }
};

exports.getRedirect = async (req, res, next) => {
  try {
    //decode the url from base64
    const encodedUrl = req.params.url;
    let binaryData = Buffer.from(encodedUrl, "base64");
    let decoded = binaryData.toString("utf8");

    const [
      fetchedUrl,
    ] = await db.execute("SELECT url, idUser FROM urls WHERE idURLs=?", [
      decoded,
    ]);

    //there is no url found
    if (fetchedUrl.length == 0) {
      throw new Error();
    }

    let url = fetchedUrl[0].url;
    idUser = fetchedUrl[0].idUser;
    if (idUser != null) {
      await db.execute(
        "INSERT INTO clicks_log (idURL, browser, os) VALUES (?,?,?)",
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
    const [
      urls,
    ] = await db.execute(
      "SELECT idURLs, url, urlConverted, DATE_FORMAT(createdAt,'%d/%m/%Y') as createdAt FROM urls WHERE idUser=?",
      [idUser]
    );

    res.render("analytics", {
      pageTitle: "Analytics",
      urls,
      user: req.session.user,
      domain: process.env.DOMAIN,
    });
  } catch (err) {
    res.redirect("/error");
  }
};

exports.getAnalyticsById = async (req, res, next) => {
  try {
    if (req.session.user == undefined) {
      return res.redirect("/login");
    }
    const idURL = req.params.idURL;
    const [clicks] = await db.execute(
      "SELECT * FROM clicks_log WHERE idURL=?",
      [idURL]
    );
    totalClicks = clicks.length;


    //Parse logs
    let dataBrowser = [];
    let labelsBrowser = [];
    let dataOs = [];
    let lablesOs = [];

    for (let i = 0; i < totalClicks; i++) {
      //BROWSERS
      if (labelsBrowser.indexOf(clicks[i].browser) == -1) {
        labelsBrowser.push(clicks[i].browser);
      }

      let indexBrowser = labelsBrowser.indexOf(clicks[i].browser);
      if (isNaN(dataBrowser[indexBrowser])) {
        dataBrowser[indexBrowser] = 1;
      } else {
        dataBrowser[indexBrowser]++;
      }

      //OS
      if (lablesOs.indexOf(clicks[i].os) == -1) {
        lablesOs.push(clicks[i].os);
      }

      let indexOs = lablesOs.indexOf(clicks[i].os);
      if (isNaN(dataOs[indexOs])) {
        dataOs[indexOs] = 1;
      } else {
        dataOs[indexOs]++;
      }
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
  } catch (err) {
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
