import { Application } from "express";
import homeRoutes from "./home.routes";
import roomRoutes from "./room.routes";
import messageRoutes from "./message.routes";
import oauth2Routes from "./oauth2.routes";

export default class Routes {
  constructor(app: Application) {
    app.use("/api", homeRoutes);
    app.use("/api/room", roomRoutes);
    app.use("/api/message", messageRoutes);
    app.use("/api/oauth2", oauth2Routes);
  }
}
