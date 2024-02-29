import { Request, Response } from "express";

// Utils
import { throwIfMissing } from "../../utils/utils";

interface AppInfos {
  version_name: string;
  action:
    | "delete"
    | "reset"
    | "set"
    | "set_fail"
    | "update_fail"
    | "download_fail"
    | "update_fail"
    | "download_10"
    | "download_20"
    | "download_30"
    | "download_40"
    | "download_50"
    | "download_60"
    | "download_70"
    | "download_80"
    | "download_90"
    | "download_complete";
  version_build: string;
  version_code: string;
  version_os: string;
  plugin_version: string;
  platform: string;
  app_id: string;
  device_id: string;
  custom_id?: string;
  is_prod?: boolean;
  is_emulator?: boolean;
}

export default class RoomController {
  async stats(req: Request, res: Response) {
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
        action,
        version_code,
        version_os,
        device_id,
        version_name,
        version_build,
        plugin_version,
      } = req.body;

      console.log(
        "update asked",
        platform,
        app_id,
        action,
        version_os,
        version_code,
        device_id,
        version_name,
        version_build,
        plugin_version
      );
      // Save it in your database
      return res.json({ status: "ok" });
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .json({ message: "Internal Server Error", version: "", url: "" });
    }
  }
}
