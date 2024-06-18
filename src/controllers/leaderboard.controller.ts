import { Request, Response } from "express";
import "dotenv/config";
import { Client, Databases, Query } from "node-appwrite";

const env: any = {
  APP_ENDPOINT: process.env.APP_ENDPOINT as string,
  APP_PROJECT: process.env.APP_PROJECT as string,
  APP_DATABASE: process.env.APP_DATABASE as string,
  API_KEY: process.env.API_KEY as string,
  WALLET_COLLECTION: process.env.WALLET_COLLECTION as string,
};

export default class LeaderboardController {
  async token(req: Request, res: Response) {
    try {
      console.log("wallet leaderboard");

      const client = new Client()
        .setEndpoint(env.APP_ENDPOINT)
        .setProject(env.APP_PROJECT)
        .setKey(env.API_KEY)
        .setSelfSigned();

      const database = new Databases(client);

      // Create user data
      const response = await database.listDocuments(
        env.APP_DATABASE,
        env.WALLET_COLLECTION,
        [Query.orderDesc("balance")]
      );

      response.documents = response.documents.map((doc) => {
        doc.$id = doc.$id.slice(0, -10);
        doc.$permissions = [];
        doc.$databaseId = "";
        doc.$createdAt = "";
        doc.$updatedAt = "";
        doc.$collectionId = "";
        return doc;
      });
      response.total = response.documents.length;

      return res.send(response);
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
        err: err,
      });
    }
  }
}
