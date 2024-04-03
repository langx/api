import { Request, Response } from "express";
import "dotenv/config";
import {
  Client,
  Databases,
  Account,
  Permission,
  Role,
  Models,
} from "node-appwrite";

// Utils
import { throwIfMissing } from "../utils/utils";

const env: any = {
  APP_ENDPOINT: process.env.APP_ENDPOINT as string,
  APP_PROJECT: process.env.APP_PROJECT as string,
  APP_DATABASE: process.env.APP_DATABASE as string,
  API_KEY: process.env.API_KEY as string,
  USERS_COLLECTION: process.env.USERS_COLLECTION as string,
  MESSAGES_COLLECTION: process.env.MESSAGES_COLLECTION as string,
  ROOMS_COLLECTION: process.env.ROOMS_COLLECTION as string,
};

interface UserDocument extends Models.Document {
  blockedUsers?: string[];
}

export default class UserController {
  async update(req: Request, res: Response) {
    try {
      console.log("update user");
      throwIfMissing(req.headers, ["x-appwrite-user-id", "x-appwrite-jwt"]);
      if (!req.body || Object.keys(req.body).length === 0) {
        console.log("Request body is empty.");
        return res
          .status(400)
          .json({ ok: false, error: "Request body is empty." });
      }

      const sender: string = req.headers["x-appwrite-user-id"] as string;
      const jwt: string = req.headers["x-appwrite-jwt"] as string;

      console.log(`sender: ${sender}`);
      console.log(`jwt: ${jwt}`);

      // Set data to variables
      const data: any = req.body;

      const disallowedFields = [
        "country",
        "countyCode",
        "gender",
        "birthdate",
        "badges",
        "totalUnseen",
        "totalUnseenArchived",
        "contributors",
        "sponsor",
        "streaks",
      ];

      for (const field of disallowedFields) {
        if (data.hasOwnProperty(field)) {
          console.log(`Disallowed field "${field}" found in request body.`);
          return res
            .status(400)
            .json({ ok: false, error: `Field "${field}" is not allowed.` });
        }
      }

      console.log("Environment variables: ", env);

      // Check JWT
      const verifyUser = new Client()
        .setEndpoint(env.APP_ENDPOINT)
        .setProject(env.APP_PROJECT)
        .setJWT(jwt);

      const account = new Account(verifyUser);
      const user = await account.get();
      console.log(`user: ${JSON.stringify(user)}`);

      if (user.$id !== sender) {
        return res.status(400).json({ ok: false, error: "jwt is invalid" });
      }

      const client = new Client()
        .setEndpoint(env.APP_ENDPOINT)
        .setProject(env.APP_PROJECT)
        .setKey(env.API_KEY);

      const database = new Databases(client);

      const currentUserDoc = (await database.getDocument(
        env.APP_DATABASE,
        env.USERS_COLLECTION,
        sender
      )) as UserDocument;

      // Update user data
      console.log("Updating user data...", data);
      const response = await database.updateDocument(
        env.APP_DATABASE,
        env.USERS_COLLECTION,
        sender,
        data
      );

      return res.send(response);
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
        err: err,
      });
    }
  }
}
