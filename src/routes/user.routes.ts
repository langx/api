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
    this.router.put("/:id", this.controller.update);
    this.router.patch("/:id", this.controller.update); // TODO: Deprecated! Remove this line in the future.
  }
}

export default new MessageRoutes().router;
