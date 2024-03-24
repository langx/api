import { Request, Response } from "express";
import "dotenv/config";

const env: any = {
  ANDROID_VERSION: process.env.ANDROID_VERSION as string,
  ANDROID_MAINTENANCE: (process.env.ANDROID_MAINTENANCE as string) === "true",
  IOS_VERSION: process.env.IOS_VERSION as string,
  IOS_MAINTENANCE: (process.env.IOS_MAINTENANCE as string) === "true",
};

interface AppUpdate {
  latest: string;
  maintenance_enabled: boolean;
  maintenace_msg?: {
    title: string;
    message: string;
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
        latest: env.ANDROID_VERSION,
        maintenance_enabled: env.ANDROID_MAINTENANCE,
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
        latest: env.IOS_VERSION,
        maintenance_enabled: env.IOS_MAINTENANCE,
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

  async web(req: Request, res: Response) {
    try {
      let appUpdate: AppUpdate = {
        latest: env.WEB_VERSION,
        maintenance_enabled: env.WEB_MAINTENANCE,
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
