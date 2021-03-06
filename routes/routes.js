const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");
const authController = require("../controllers/auth");

router.get("/", controller.getHome);
router.post("/", controller.postAddUrl);

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/logout", controller.getLogout);

router.get("/analytics", controller.getAnalytics);

router.get("/analytics/:idURL", controller.getAnalyticsById);

router.get("/error", controller.getError);

router.get("/:url", controller.getRedirect);

module.exports = router;
