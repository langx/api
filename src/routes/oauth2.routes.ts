import { Router } from "express";
import OAuth2Controller from "../controllers/oauth2.controller";

class oauth2Routes {
  router = Router();
  controller = new OAuth2Controller();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.get("/", this.controller.redirect);
  }
}

export default new oauth2Routes().router;
