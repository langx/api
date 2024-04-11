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

interface RoomDocument extends Models.Document {
  users: string[];
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
      const replyTo: string = req.body.replyTo || null;

      switch (type) {
        case "body":
          throwIfMissing(req.body, ["body"]);
          break;
        case "image":
          throwIfMissing(req.body, ["imageId"]);
          break;
        case "audio":
          throwIfMissing(req.body, ["audioId"]);
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

      // Check Room has this user or not
      const roomDoc = (await database.getDocument(
        env.APP_DATABASE,
        env.ROOMS_COLLECTION,
        roomId
      )) as RoomDocument;

      // console.log(`roomDoc.users: ${roomDoc.users}`);
      // console.log(`sender: ${sender}`);
      // console.log(`to: ${to}`);

      // Check if the user is in the room
      if (!roomDoc.users.includes(sender) || !roomDoc.users.includes(to)) {
        res.status(403).json({ message: "You are not in this room." });
        return;
      }

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

      // Create a message
      let messageData = {
        sender: sender,
        to: to,
        roomId: roomId,
        replyTo: replyTo,
        seen: false,
        deleted: false,
        type: type,
        body: null,
        imageId: null,
        audioId: null,
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
            imageId: req.body.imageId,
          };
          break;
        case "audio":
          messageData = {
            ...messageData,
            audioId: req.body.audioId,
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
        [Permission.read(Role.user(to)), Permission.read(Role.user(sender))]
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

  async update(req: Request, res: Response) {
    try {
      console.log("update message");
      throwIfMissing(req.headers, ["x-appwrite-user-id", "x-appwrite-jwt"]);
      throwIfMissing(req.params, ["id"]);
      if (!req.body || Object.keys(req.body).length === 0) {
        console.log("Request body is empty.");
        return res
          .status(400)
          .json({ ok: false, error: "Request body is empty." });
      }

      const sender: string = req.headers["x-appwrite-user-id"] as string;
      const jwt: string = req.headers["x-appwrite-jwt"] as string;
      // Set data to variables
      const messageId: string = req.params.id;
      const data: any = req.body;
      // console.log(messageId);
      // console.log(data);

      const disallowedFields = ["sender", "to", "roomId"];

      for (const field of disallowedFields) {
        if (data.hasOwnProperty(field)) {
          console.log(`Disallowed field "${field}" found in request body.`);
          return res
            .status(400)
            .json({ ok: false, error: `Field "${field}" is not allowed.` });
        }
      }

      // Check JWT
      const verifyUser = new Client()
        .setEndpoint(env.APP_ENDPOINT)
        .setProject(env.APP_PROJECT)
        .setJWT(jwt);

      const account = new Account(verifyUser);
      const user = await account.get();

      if (user.$id !== sender) {
        return res.status(400).json({ ok: false, error: "jwt is invalid" });
      }

      const client = new Client()
        .setEndpoint(env.APP_ENDPOINT)
        .setProject(env.APP_PROJECT)
        .setKey(env.API_KEY);

      const database = new Databases(client);

      // Update the message
      let message = await database.updateDocument(
        env.APP_DATABASE,
        env.MESSAGES_COLLECTION,
        messageId,
        data
      );

      if (message?.$id) {
        console.log("message updated");
        res.status(200).json(message);
      } else {
        console.log("message not updated");
        res.status(304).json({ ok: false, message: "Not Modified" });
      }
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
        err: err,
      });
    }
  }

  //    this.router.delete("/:id", this.controller.delete);
  // delete a message
  async delete(req: Request, res: Response) {
    try {
      console.log("delete message");
      throwIfMissing(req.headers, ["x-appwrite-user-id", "x-appwrite-jwt"]);
      throwIfMissing(req.params, ["id"]);

      const sender: string = req.headers["x-appwrite-user-id"] as string;
      const jwt: string = req.headers["x-appwrite-jwt"] as string;
      const messageId: string = req.params.id;
      console.log(messageId);

      // Check JWT
      const verifyUser = new Client()
        .setEndpoint(env.APP_ENDPOINT)
        .setProject(env.APP_PROJECT)
        .setJWT(jwt);

      const account = new Account(verifyUser);
      const user = await account.get();

      if (user.$id !== sender) {
        return res.status(400).json({ ok: false, error: "jwt is invalid" });
      }

      const client = new Client()
        .setEndpoint(env.APP_ENDPOINT)
        .setProject(env.APP_PROJECT)
        .setKey(env.API_KEY);

      const database = new Databases(client);

      // Delete the message
      let message = await database.updateDocument(
        env.APP_DATABASE,
        env.MESSAGES_COLLECTION,
        messageId,
        {
          deleted: true,
          type: "body",
          body: "[deleted message]",
          imageId: null,
          audioId: null,
        }
      );
      console.log(message);

      if (message) {
        console.log("message deleted");
        res.status(200).json(message);
      } else {
        console.log("message not deleted");
        res.status(304).json({ ok: false, message: "Not Modified" });
      }
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
        err: err,
      });
    }
  }
}
