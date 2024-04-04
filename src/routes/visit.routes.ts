import { Router } from "express";
import VisitController from "../controllers/visit.controller";

class MessageRoutes {
  router = Router();
  controller = new VisitController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post("/", this.controller.create);
  }
}

export default new MessageRoutes().router;
