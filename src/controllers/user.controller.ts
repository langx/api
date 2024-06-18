import { Request, Response } from "express";
import "dotenv/config";
import { Client, Databases, Account, Permission, Role } from "node-appwrite";

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

const validateUserData = (data: any) => {
  const allowedGenders = ["male", "female", "other"];
  const birthdate = new Date(data.birthdate);

  // Check age is at least 13
  const age = getAge(birthdate);
  if (age < 13) {
    throw new Error("You must be at least 13 years old to use this app");
  }

  // Check gender is valid
  if (!allowedGenders.includes(data.gender)) {
    throw new Error("Please select a valid gender");
  }
};

const getAge = (birthdate: Date) => {
  const today = new Date();
  const age = today.getFullYear() - birthdate.getFullYear();
  const monthDifference = today.getMonth() - birthdate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthdate.getDate())
  ) {
    return age - 1;
  }
  return age;
};

export default class UserController {
  async create(req: Request, res: Response) {
    try {
      console.log("create user");
      throwIfMissing(req.headers, ["x-appwrite-user-id", "x-appwrite-jwt"]);
      if (!req.body || Object.keys(req.body).length === 0) {
        console.log("Request body is empty.");
        return res
          .status(400)
          .json({ ok: false, error: "Request body is empty." });
      }

      const sender: string = req.headers["x-appwrite-user-id"] as string;
      const jwt: string = req.headers["x-appwrite-jwt"] as string;

      // console.log(`sender: ${sender}`);
      // console.log(`jwt: ${jwt}`);

      // Set data to variables
      const data: any = req.body;
      // console.log(data);

      const disallowedFields = [
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

      // Validate user data
      try {
        validateUserData(data);
      } catch (error) {
        if (error instanceof Error) {
          return res.status(400).json({ ok: false, error: error.message });
        } else {
          return res.status(400).json({
            ok: false,
            error: "Unknown error occurred during validation",
          });
        }
      }

      // Add pre defined username
      data.username = `langx_${sender.slice(-4)}`;

      // Add default badges
      data.badges = ["early-adopter", "pioneer"];

      // Add default notifications
      data.notifications = ["email"];
      data.notificationsArray = ["message", "visit", "update", "promotion"];

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

      // Create user data
      console.log("Creating user doc...", data);
      const response = await database.createDocument(
        env.APP_DATABASE,
        env.USERS_COLLECTION,
        sender,
        data,
        [Permission.delete(Role.user(sender))]
      );

      return res.send(response);
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
        err: err,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      console.log("update user");
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
      // console.log(`sender: ${sender}`);
      // console.log(`jwt: ${jwt}`);

      // Check if user is updating their own data
      if (sender !== req.params.id) {
        return res.status(400).json({
          ok: false,
          error: "You can only update your own data.",
        });
      }

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

      const reservedUsernames = [
        "admin",
        "administrator",
        "moderator",
        "mod",
        "support",
        "help",
        "contact",
        "info",
        "root",
        "sys",
        "system",
        "super",
        "superuser",
        "user",
        "users",
        "account",
        "accounts",
        "profile",
        "profiles",
        "settings",
        "setting",
        "config",
        "configuration",
        "console",
        "dashboard",
        "langx",
        "token",
        "learn",
        "practice",
        "teacher",
        "langxapp",
        "xue",
      ];

      // Check Username Data
      // Check Username Data
      if (data.hasOwnProperty("username")) {
        const pattern = /^[a-zA-Z0-9_]*$/;
        if (!pattern.test(data.username)) {
          return res.status(400).json({
            ok: false,
            error:
              "Invalid username. Only alphanumeric characters and underscores are allowed.",
          });
        }

        // Check if username is in the reserved list
        if (reservedUsernames.includes(data.username)) {
          return res.status(400).json({
            ok: false,
            error:
              "This username is reserved. Please choose a different username.",
          });
        }
      }

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
      // console.log(`user: ${JSON.stringify(user)}`);

      if (user.$id !== sender) {
        return res.status(400).json({ ok: false, error: "jwt is invalid" });
      }

      const client = new Client()
        .setEndpoint(env.APP_ENDPOINT)
        .setProject(env.APP_PROJECT)
        .setKey(env.API_KEY);

      const database = new Databases(client);

      // Update user data
      const response = await database.updateDocument(
        env.APP_DATABASE,
        env.USERS_COLLECTION,
        sender,
        data
      );

      console.log("Updated user doc: ", data);
      return res.send(response);
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error!",
        err: err,
      });
    }
  }
}
