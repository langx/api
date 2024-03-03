import { Request, Response } from "express";

interface AppUpdate {
  latest: string;
  maintenance_enabled: boolean;
  maintenace_msg?: {
    title: string;
    message: string;
    button: string;
  };
  major_update_msg?: {
    title: string;
    message: string;
    button: string;
  };
  minor_update_msg?: {
    title: string;
    message: string;
    button: string;
  };
}

const messages = {
  maintenace_msg: {
    title: "Maintenance Mode",
    message: "The app is currently under maintenance. Please check back later.",
    button: "OK",
  },
  major_update_msg: {
    title: "Major Update Available",
    message:
      "A major update is available. Please update to continue using the app.",
    button: "Update Now",
  },
  minor_update_msg: {
    title: "Minor Update Available",
    message: "A minor update is available. Would you like to update now?",
    button: "Update Now",
  },
};

export default class RoomController {
  async android(req: Request, res: Response) {
    try {
      let appUpdate: AppUpdate = {
        latest: "0.5.18",
        maintenance_enabled: false,
        ...messages,
      };

      return res.json(appUpdate);
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .json({ message: "Internal Server Error", version: "", url: "" });
    }
  }

  async ios(req: Request, res: Response) {
    try {
      let appUpdate: AppUpdate = {
        latest: "0.5.18",
        maintenance_enabled: false,
        ...messages,
      };

      return res.json(appUpdate);
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .json({ message: "Internal Server Error", version: "", url: "" });
    }
  }
}
