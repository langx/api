import { Router } from "express";
import BlockController from "../controllers/user/block.controller";

class UserRoutes {
  router = Router();
  controller = new BlockController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post("/block", this.controller.create);
  }
}

export default new UserRoutes().router;
