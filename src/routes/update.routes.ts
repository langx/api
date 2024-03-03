import { Router } from "express";
import UpdateController from "../controllers/update.controller";

class UpdateRoutes {
  router = Router();
  updateController = new UpdateController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.get("/", this.updateController.update);
  }
}

export default new UpdateRoutes().router;
