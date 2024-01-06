import { Application } from "express";

import homeRoutes from "./home.routes";
import roomRoutes from "./room.routes";
import messageRoutes from "./message.routes";
import userRoutes from "./user.routes";

export default class Routes {
  constructor(app: Application) {
    app.use("/api", homeRoutes);
    app.use("/api/room", roomRoutes);
    app.use("/api/message", messageRoutes);
    app.use("/api/user", userRoutes);
  }
}
