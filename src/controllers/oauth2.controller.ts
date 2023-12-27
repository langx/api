import { Request, Response } from "express";
import axios from "axios";
import "dotenv/config";

import { throwIfMissing } from "../utils/utils";

const env: any = {
  APP_ENDPOINT: process.env.APP_ENDPOINT as string,
  APP_PROJECT: process.env.APP_PROJECT as string,
  API_KEY: process.env.API_KEY as string,
};

export default class OAuth2Controller {
  async redirect(req: Request, res: Response) {
    console.log("req.headers: ", req.headers);
    console.log("req.baseUrl", req.baseUrl);
    console.log("req.url", req.url);
    console.log("req.originalUrl", req.originalUrl);
    console.log("req.params", req.params);
    console.log("req.body", req.body);
    console.log("req.query", req.query);

    const clonedReq = {
      method: "get",
      url: "https://db.languagexchange.net/v1/account/sessions/oauth2/callback/google/650750d21e4a6a589be3",
      headers: req.headers,
      params: req.query,
    };

    try {
      const response = await axios(clonedReq);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }

    res.end("processing...");
  }
}
