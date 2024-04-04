import { Router } from "express";
import MessageController from "../controllers/message.controller";

class MessageRoutes {
  router = Router();
  controller = new MessageController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post("/", this.controller.create);
    this.router.patch("/", this.controller.update);
    this.router.delete("/:id", this.controller.delete);
  }
}

export default new MessageRoutes().router;
