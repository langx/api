import { Request, Response } from "express";
import { throwIfMissing } from "../../utils/utils";
import { Client, Databases, Account, Query } from "node-appwrite";
import "dotenv/config";

const env: any = {
  APP_ENDPOINT: process.env.APP_ENDPOINT as string,
  APP_PROJECT: process.env.APP_PROJECT as string,
  API_KEY: process.env.API_KEY as string,
  APP_DATABASE: process.env.APP_DATABASE as string,
  ROOMS_COLLECTION: process.env.ROOMS_COLLECTION as string,
};

export default class BlockController {
  async create(req: Request, res: Response) {
    try {
      throwIfMissing(req.headers, ["x-appwrite-user-id", "x-appwrite-jwt"]);
      throwIfMissing(req.body, ["to"]);
      const sender: string = req.headers["x-appwrite-user-id"] as string;
      const jwt: string = req.headers["x-appwrite-jwt"] as string;
      const to: string = req.body.to;

      // Logs
      console.log(typeof req.headers["x-appwrite-jwt"], jwt);
      console.log(typeof req.headers["x-appwrite-user-id"], sender);
      console.log(typeof to, to);

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

      const queries: any[] = [];

      // Query for rooms, user attribute that contain current user and userId
      queries.push(Query.search("users", sender));
      queries.push(Query.search("users", to));

      // Create document
      let rooms = await database.listDocuments(
        env.APP_DATABASE,
        env.ROOMS_COLLECTION,
        queries
      );

      if (rooms.total > 0) {
        const room = rooms.documents[0];
        console.log("room found", room);
        const updatedRoom = await database.updateDocument(
          env.APP_DATABASE,
          env.ROOMS_COLLECTION,
          room.$id,
          undefined,
          []
        );
        console.log("room updated", updatedRoom);
        res.status(201).json({ ok: true, message: "Room updated" });
      } else {
        res.status(200).json({ ok: true, message: "No rooms found" });
      }
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
        err: err,
      });
    }
  }
}
