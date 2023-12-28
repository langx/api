import { Request, Response } from "express";
import axios from "axios";
import https from "https";
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
    };

    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    try {
      const response = await axios({
        url: `https://${options.hostname}${options.path}`,
        method: options.method,
        headers: options.headers,
        httpsAgent: agent,
      });

      console.log(response.data);
      res.send(response.data);
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      res.send(error);
    }
  }
}
