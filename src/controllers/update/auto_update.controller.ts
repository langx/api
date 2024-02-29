import { Request, Response } from "express";

// Utils
import { throwIfMissing } from "../../utils/utils";

interface AppInfos {
  version_name: string;
  version_build: string;
  version_os: string;
  custom_id?: string;
  is_prod?: boolean;
  is_emulator?: boolean;
  plugin_version: string;
  platform: string;
  app_id: string;
  device_id: string;
}

export default class RoomController {
  async auto_update(req: Request, res: Response) {
    try {
      throwIfMissing(req.body, [
        "version_name",
        "version_build",
        "version_os",
        "platform",
        "app_id",
        "device_id",
        "plugin_version",
      ]);

      let {
        platform,
        app_id,
        version_os,
        device_id,
        version_name,
        version_build,
        plugin_version,
        is_prod,
      } = req.body;
      version_name += "v" + version_name;

      // Fetch the latest release from the GitHub API
      const response = await fetch(
        "https://api.github.com/repos/languageXchange/languageXchange/releases/latest"
      );
      const data = await response.json();

      // Extract the version and zipball_url from the response
      const latestVersion = data.tag_name;
      const latestUrl = data.zipball_url;

      console.log("appVersion", version_name);
      console.log("latestVersion", latestVersion);

      if (version_name === latestVersion) {
        return res.json({
          message: "You're up to date!",
          version: "",
          url: "",
        });
      } else {
        return res.json({
          message: "New version available",
          version: latestVersion,
          url: latestUrl,
        });
      }
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .json({ message: "Internal Server Error", version: "", url: "" });
    }
  }
}
