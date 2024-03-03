import { Request, Response } from "express";

// Utils
// import { throwIfMissing } from "../utils/utils";

interface AppUpdate {
  current: string;
  enabled: boolean;
  msg_maintenace?: {
    title: string;
    message: string;
    button: string;
  };
  msg_major_update?: {
    title: string;
    message: string;
    button: string;
  };
  msg_minor_update?: {
    title: string;
    message: string;
    button: string;
  };
}

export default class RoomController {
  async update(req: Request, res: Response) {
    try {
      console.log("req.body: ", req.body);

      let appUpdate: AppUpdate = {
        current: "1.0.0",
        enabled: true,
        msg_maintenace: {
          title: "Maintenance Mode",
          message:
            "The app is currently under maintenance. Please check back later.",
          button: "OK",
        },
        msg_major_update: {
          title: "Major Update Available",
          message:
            "A major update is available. Please update to continue using the app.",
          button: "Update Now",
        },
        msg_minor_update: {
          title: "Minor Update Available",
          message: "A minor update is available. Would you like to update now?",
          button: "Update Now",
        },
      };

      return res.json(appUpdate);

      // throwIfMissing(req.body, [
      //   "version_name",
      //   "version_build",
      //   "version_os",
      //   "platform",
      //   "app_id",
      //   "device_id",
      //   "plugin_version",
      // ]);

      // let {
      //   platform,
      //   app_id,
      //   version_os,
      //   device_id,
      //   version_name,
      //   version_build,
      //   plugin_version,
      //   is_prod,
      // } = req.body;

      // // Fetch the latest release from the GitHub API
      // const response = await axios.get("https://api.github.com/repos/languageXchange/languageXchange/releases/latest");
      // const data = response.data;

      // // Extract the version and zipball_url from the response
      // const latestVersion = data.tag_name.startsWith("v")
      //   ? data.tag_name.substring(1)
      //   : data.tag_name;
      // const latestUrl = data.zipball_url;

      // console.log("appVersion", version_name);
      // console.log("latestVersion", latestVersion);

      // if (version_name === latestVersion) {
      //   return res.json({
      //     message: "You're up to date!",
      //     version: "",
      //     url: "",
      //   });
      // } else {
      //   return res.json({
      //     message: "New version available",
      //     version: latestVersion,
      //     url: latestUrl,
      //   });
      // }
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .json({ message: "Internal Server Error", version: "", url: "" });
    }
  }
}
