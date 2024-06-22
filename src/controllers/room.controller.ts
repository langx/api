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
  badges?: string[];
}

interface RoomDocument extends Models.Document {
  users: string[];
  copilot: string[];
  unseen: number[];
  archived: string[];
  typing: Date[];
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
      let roomData;
      const defaultDate = new Date(2000, 0, 1);

      if (sender > to) {
        roomData = {
          users: [sender, to],
          copilot: [],
          typing: [defaultDate, defaultDate],
          unseen: [0, 0],
        };
      } else {
        roomData = {
          users: [to, sender],
          copilot: [],
          typing: [defaultDate, defaultDate],
          unseen: [0, 0],
        };
      }

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

  async update(req: Request, res: Response) {
    try {
      console.log("update room");

      // Validate headers and parameters
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
      const roomId: string = req.params.id;
      const data: { copilot?: boolean; archived?: boolean; typing?: boolean } =
        req.body;

      // Disallow fields that should not be updated
      const disallowedFields = ["users"];
      for (const field of disallowedFields) {
        if (data.hasOwnProperty(field)) {
          console.log(`Disallowed field "${field}" found in request body.`);
          return res
            .status(400)
            .json({ ok: false, error: `Field "${field}" is not allowed.` });
        }
      }

      // Verify JWT
      const verifyClient = new Client()
        .setEndpoint(env.APP_ENDPOINT)
        .setProject(env.APP_PROJECT)
        .setJWT(jwt);
      const account = new Account(verifyClient);
      const user = await account.get();
      if (user.$id !== sender) {
        return res.status(400).json({ ok: false, error: "JWT is invalid" });
      }

      const client = new Client()
        .setEndpoint(env.APP_ENDPOINT)
        .setProject(env.APP_PROJECT)
        .setKey(env.API_KEY);
      const database = new Databases(client);

      // Check if user has early-adopter badge
      const currentUserDoc = (await database.getDocument(
        env.APP_DATABASE,
        env.USERS_COLLECTION,
        sender
      )) as UserDocument;
      if (!currentUserDoc.badges?.includes("early-adopter")) {
        return res.status(403).json({
          message: "You need to have early-adopter badge to update this room.",
        });
      }

      // Check if user is a member of the room
      const room: RoomDocument = await database.getDocument(
        env.APP_DATABASE,
        env.ROOMS_COLLECTION,
        roomId
      );
      if (!room.users.includes(sender)) {
        return res
          .status(403)
          .json({ message: "You are not a member of this room." });
      }

      // Update copilot field
      const isSenderInCopilot = room.copilot.includes(sender);
      if (data.copilot && !isSenderInCopilot) {
        console.log("Copilot set to the current user.");
        room.copilot.push(sender);
      } else if (!data.copilot && isSenderInCopilot) {
        console.log("Copilot removed from the room.");
        room.copilot = room.copilot.filter((item) => item !== sender);
      }

      // Update archived field
      const isSenderInArchived = room.archived.includes(sender);
      if (data.archived && !isSenderInArchived) {
        console.log("Archived set to the current user.");
        room.archived.push(sender);
      } else if (!data.archived && isSenderInArchived) {
        console.log("Archived removed from the room.");
        room.archived = room.archived.filter((item) => item !== sender);
      }

      // Update typing field
      if (data.typing) {
        console.log("Typing:", data.typing);
        room.typing[room.users.indexOf(sender)] = new Date();
      } else {
        console.log("Typing:", data.typing);
        room.typing[room.users.indexOf(sender)] = new Date(2000, 0, 1);
      }

      // Update the room
      const updatedRoom = await database.updateDocument(
        env.APP_DATABASE,
        env.ROOMS_COLLECTION,
        roomId,
        {
          copilot: room.copilot,
          archived: room.archived,
          typing: room.typing,
        }
      );

      if (updatedRoom?.$id) {
        console.log("Room updated");
        res.status(200).json(updatedRoom);
      } else {
        console.log("Room not updated");
        res.status(304).json({ ok: false, message: "Not Modified" });
      }
    } catch (err) {
      console.error(err); // Added error logging for better debugging
      res.status(500).json({ message: "Internal Server Error!", err });
    }
  }
}
