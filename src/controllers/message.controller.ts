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

export default class MessageController {
  async create(req: Request, res: Response) {
    try {
      throwIfMissing(req.headers, ["x-appwrite-user-id", "x-appwrite-jwt"]);
      throwIfMissing(req.body, ["$id", "to", "roomId", "type"]);
      const sender: string = req.headers["x-appwrite-user-id"] as string;
      const jwt: string = req.headers["x-appwrite-jwt"] as string;

      // Set data to variables
      const $id: string = req.body.$id;
      const to: string = req.body.to;
      const roomId: string = req.body.roomId;
      const type: string = req.body.type;

      switch (type) {
        case "body":
          throwIfMissing(req.body, ["body"]);
          break;
        case "image":
          throwIfMissing(req.body, ["image"]);
          break;
        case "audio":
          throwIfMissing(req.body, ["audio"]);
          break;
        default:
          // Send error response
          res.status(400).json({
            ok: false,
            error: "type is not valid",
          });
          break;
      }

      // Logs
      // console.log(typeof req.headers["x-appwrite-jwt"], jwt);
      // console.log(typeof req.headers["x-appwrite-user-id"], sender);

      // console.log(typeof $id, $id);
      // console.log(typeof to, to);
      // console.log(typeof type, type);

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
        res.status(403).json({ message: "You block the user." });
        return;
      }

      if (userDoc?.blockedUsers?.includes(sender)) {
        res.status(403).json({ message: "You have been blocked." });
        return;
      }

      // Create a message
      let messageData = {
        sender: sender,
        to: to,
        roomId: roomId,
        seen: false,
        type: type,
        body: null,
        image: null,
        audio: null,
      };

      switch (type) {
        case "body":
          messageData = {
            ...messageData,
            body: req.body.body,
          };
          break;
        case "image":
          messageData = {
            ...messageData,
            image: req.body.image,
          };
          break;
        case "audio":
          messageData = {
            ...messageData,
            audio: req.body.audio,
          };
          break;
        default:
          // Send error response
          res.status(400).json({
            ok: false,
            error: "type is not valid",
          });
          break;
      }

      // console.log(`messageData: ${JSON.stringify(messageData)}`);

      // Create document
      let message = await database.createDocument(
        env.APP_DATABASE,
        env.MESSAGES_COLLECTION,
        $id,
        messageData,
        [
          Permission.read(Role.user(to)),
          Permission.update(Role.user(to)),
          Permission.read(Role.user(sender)),
          Permission.update(Role.user(sender)),
          Permission.delete(Role.user(sender)),
        ]
      );

      // console.log(`message: ${JSON.stringify(message)}`);

      if (message?.$id) {
        console.log("message created");
        // Update room $updatedAt
        let room = await database.updateDocument(
          env.APP_DATABASE,
          env.ROOMS_COLLECTION,
          roomId,
          { $updatedAt: Date.now() }
        );
        room?.$id
          ? console.log("room updated")
          : console.log("room not updated");
        res.status(201).json(message);
      } else {
        console.log("message not created");
        res.status(304).json({ message: "Not Modified" });
      }
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
        err: err,
      });
    }
  }
}
