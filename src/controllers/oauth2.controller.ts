import { Request, Response } from "express";
import { Client, Account } from "appwrite";
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

    const client = new Client()
      .setEndpoint(env.APP_ENDPOINT)
      .setProject(env.APP_PROJECT);

    const account = new Account(client);

    const oauth2 = account.createOAuth2Session(
      "google",
      "https://api.languagexchnage.net/api/oauth2",
      "https://app.languagexchnage.net/login/"
    );

    res.end("processing...");
  }
}
