import { Router } from "express";
import MailController from "../controllers/mail.controller";

class MailRoutes {
  router = Router();
  updateController = new MailController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post("/", this.updateController.create);
  }
}

export default new MailRoutes().router;
