import { Request, Response } from "express";
import { Client, Databases, Query } from "node-appwrite";
import "dotenv/config";

const env: any = {
  APP_ENDPOINT: process.env.APP_ENDPOINT as string,
  APP_PROJECT: process.env.APP_PROJECT as string,
  API_KEY: process.env.API_KEY as string,
  APP_DATABASE: process.env.APP_DATABASE as string,
  USERS_COLLECTION: process.env.USERS_COLLECTION as string,
  ROOMS_COLLECTION: process.env.ROOMS_COLLECTION as string,
};

export default class UserController {
  async update(req: Request, res: Response) {
    res.json({ message: "user endpoint" });
    // const client = new Client();

    // client
    //   .setEndpoint(env.APP_ENDPOINT) // Your API Endpoint
    //   .setProject(env.APP_PROJECT) // Your project ID
    //   .setKey(env.API_KEY) // Your secret API key
    //   .setSelfSigned(); // Use only on dev mode with a self-signed SSL cert

    // let db = new Databases(client);

    // Define queries
    // const queries: any[] = [];

    // Query for users that are not the current user
    // queries.push(Query.offset(0));

    // const updateDocuments = async () => {
    //   try {
    //     const response = await db.listDocuments(env.APP_DATABASE, env.USERS_COLLECTION, queries);
    //     const documentIds = response.documents.map(document => document.$id);

    //     for (const id of documentIds) {
    //       try {
    //         const updateResponse = await db.updateDocument(
    //           env.APP_DATABASE,
    //           env.USERS_COLLECTION,
    //           id,
    //           {
    //             notificationsArray: ["message", "visit", "update", "promotion"],
    //           }
    //         );
    //         console.log(updateResponse);
    //       } catch (updateError) {
    //         console.log(updateError);
    //       }
    //     }

    //     res.json(response.documents);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };

    // updateDocuments();
  }
}
