import { Router } from 'express';
import RoomController from '../controllers/room.controller';

class RoomRoutes {
  router = Router();
  controller = new RoomController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post('/', this.controller.create);
  }
}

export default new RoomRoutes().router;
