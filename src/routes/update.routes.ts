import { Router } from "express";
import UpdateController from "../controllers/update/auto_update.controller";
// import StatsController from '../controllers/update/stats.controller';

class UpdateRoutes {
  router = Router();
  updateController = new UpdateController();
  statsController = new UpdateController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post("/auto_update", this.updateController.auto_update);
    // this.router.post('/stats', this.controller.stats);
  }
}

export default new UpdateRoutes().router;
