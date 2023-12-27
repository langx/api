import { Request, Response } from "express";
// import { Client, Account } from "appwrite";
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

    // const client = new Client()
    //   .setEndpoint(env.APP_ENDPOINT)
    //   .setProject(env.APP_PROJECT);

    // const account = new Account(client);

    // const oauth2 = account.createOAuth2Session(
    //   "google",
    //   "https://api.languagexchnage.net/api/oauth2",
    //   "https://app.languagexchnage.net/login/"
    // );

    const provider = "google"; // replace with your provider

    axios
      .get(`/v1/account/sessions/oauth2/${provider}`, {
        baseURL: env.APP_ENDPOINT,
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Response-Format": "1.4.0",
          "X-Appwrite-Project": env.APP_PROJECT,
        },
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });

    res.end("processing...");
  }
}
