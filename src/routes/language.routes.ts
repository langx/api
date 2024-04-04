import { Router } from "express";
import LanguageController from "../controllers/language.controller";

class MessageRoutes {
  router = Router();
  controller = new LanguageController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post("/", this.controller.create);
    this.router.patch("/:id", this.controller.update);
  }
}

export default new MessageRoutes().router;
