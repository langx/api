import { Router } from "express";
import UserController from "../controllers/user.controller";

class MessageRoutes {
  router = Router();
  controller = new UserController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post("/", this.controller.create);
    this.router.patch("/", this.controller.update);
  }
}

export default new MessageRoutes().router;
