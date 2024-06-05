const express = require("express");
const UserController = require("../controllers/user.controller.js");
const router = express.Router();
const passport = require("passport");

const userController = new UserController();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  userController.profile
);
router.post("/logout", userController.logout.bind(userController));
//Admin
router.get(
  "/admin",
  passport.authenticate("jwt", { session: false }),
  userController.admin
);
// GitHub
router.get("/auth/github", userController.githubAuth);
router.get("/auth/github/callback", userController.githubAuthCallback);
//Integradora 3
router.post("/requestPasswordReset", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);
router.put("/premium/:uid", userController.cambiarRolPremium);

module.exports = router;
