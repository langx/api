import { Request, Response } from "express";
import "dotenv/config";
import {
  Client,
  Databases,
  Account,
  ID,
  Permission,
  Role,
  Models,
} from "node-appwrite";

// Utils
import { throwIfMissing } from "../utils/utils";

const env: any = {
  APP_ENDPOINT: process.env.APP_ENDPOINT as string,
  APP_PROJECT: process.env.APP_PROJECT as string,
  API_KEY: process.env.API_KEY as string,
  APP_DATABASE: process.env.APP_DATABASE as string,
  USERS_COLLECTION: process.env.USERS_COLLECTION as string,
  ROOMS_COLLECTION: process.env.ROOMS_COLLECTION as string,
};

interface UserDocument extends Models.Document {
  blockedUsers?: string[];
}

export default class RoomController {
  async create(req: Request, res: Response) {
    try {
      throwIfMissing(req.headers, ["x-appwrite-user-id", "x-appwrite-jwt"]);
      throwIfMissing(req.body, ["to"]);
      const sender: string = req.headers["x-appwrite-user-id"] as string;
      const jwt: string = req.headers["x-appwrite-jwt"] as string;
      const to: string = req.body.to;

      // Logs
      // console.log(typeof jwt, "jwt:", jwt);
      // console.log(typeof to, "to:", to);
      // console.log(typeof sender, "sender:", sender);

      // Check JWT
      const verifyUser = new Client()
        .setEndpoint(env.APP_ENDPOINT)
        .setProject(env.APP_PROJECT)
        .setJWT(jwt);

      const account = new Account(verifyUser);
      const user = await account.get();
      // console.log(`user: ${JSON.stringify(user)}`);

      if (user.$id !== sender) {
        return res.status(400).json({ ok: false, error: "jwt is invalid" });
      }

      // Create client for DB
      const client = new Client()
        .setEndpoint(env.APP_ENDPOINT)
        .setProject(env.APP_PROJECT)
        .setKey(env.API_KEY);

      const database = new Databases(client);

      // Check user blocked or not
      const currentUserDoc = (await database.getDocument(
        env.APP_DATABASE,
        env.USERS_COLLECTION,
        sender
      )) as UserDocument;

      const userDoc = (await database.getDocument(
        env.APP_DATABASE,
        env.USERS_COLLECTION,
        to
      )) as UserDocument;

      // console.log(`currentUserDoc: ${JSON.stringify(currentUserDoc)}`);
      // console.log(`userDoc: ${JSON.stringify(userDoc)}`);

      if (currentUserDoc?.blockedUsers?.includes(to)) {
        res.status(403).json({ message: "You have blocked this user." });
        return;
      }

      if (userDoc?.blockedUsers?.includes(sender)) {
        res
          .status(403)
          .json({ message: "You have been blocked by this user." });
        return;
      }

      // Create a room
      let roomData = { users: [sender, to] };

      // Create document
      let room = await database.createDocument(
        env.APP_DATABASE,
        env.ROOMS_COLLECTION,
        ID.unique(),
        roomData,
        [Permission.read(Role.user(sender)), Permission.read(Role.user(to))]
      );

      room?.$id ? console.log("room created") : console.log("room not created");

      res.status(201).json(room);
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
        err: err,
      });
    }
  }
}
