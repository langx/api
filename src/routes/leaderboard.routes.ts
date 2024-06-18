import { Router } from "express";
import LeaderboardController from "../controllers/leaderboard.controller";

class LeaderboardRoutes {
  router = Router();
  controller = new LeaderboardController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.get("/token", this.controller.token);
  }
}

export default new LeaderboardRoutes().router;
