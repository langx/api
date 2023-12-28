import { Request, Response } from "express";
import * as https from "https";
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

    const options = {
      hostname: "db.languagexchange.net",
      path: "/v1/account/sessions/oauth2/callback/google/650750d21e4a6a589be3",
      method: "GET",
      headers: req.headers,
      rejectUnauthorized: false,
    };

    const request = https.request(options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        console.log(data);
        res.send(data);
      });
    });

    request.on("error", (error) => {
      console.error(error);
      res.send(error);
    });

    request.end();
  }
}
