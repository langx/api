import { Router } from "express";
import UpdateController from "../controllers/update.controller";

class UpdateRoutes {
  router = Router();
  updateController = new UpdateController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.get("/android", this.updateController.android);
    this.router.get("/ios", this.updateController.ios);
    this.router.get("/web", this.updateController.web);
  }
}

export default new UpdateRoutes().router;
