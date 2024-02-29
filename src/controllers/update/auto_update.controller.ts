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

      const {
        platform,
        app_id,
        version_os,
        device_id,
        version_name,
        version_build,
        plugin_version,
        is_prod,
      } = req.body;

      if (version_name === "0.5.16") {
        return res.json({
          version: "0.5.17",
          url: "https://github.com/languageXchange/languageXchange/archive/refs/tags/v0.5.17.zip",
        });
      } else if (version_name === "0.5.17") {
        return res.json({
          version: "0.5.17",
          url: "https://github.com/languageXchange/languageXchange/archive/refs/tags/v0.5.18.zip",
        });
      } else {
        return res.json({
          message: "Error version not found",
          version: "",
          url: "",
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
