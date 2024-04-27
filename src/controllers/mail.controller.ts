import { Request, Response } from "express";
import "dotenv/config";
import { throwIfMissing } from "../utils/utils";

const env: any = {
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY as string,
  NEWSLETTER_LIST_ID: process.env.NEWSLETTER_LIST_ID as string,
};

export default class MailController {
  async create(req: Request, res: Response) {
    try {
      throwIfMissing(req.body, ["email"]);
      // Check if the email is valid
      const email = req.body.email;
      if (!email.includes("@")) {
        return res.status(400).json({ status: "Invalid email" });
      }
      // Add the contact to the SendGrid list
      fetch("https://api.sendgrid.com/v3/marketing/contacts", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          list_ids: [env.NEWSLETTER_LIST_ID],
          contacts: [{ email }],
        }),
      }).then((response) => {
        if (response.status === 202) {
          console.log(`${email} added successfully!`);
          return res.json({ status: "ok" });
        } else {
          return res.status(400).json({ status: "Internal Server Error" });
        }
      });
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .json({ message: "Internal Server Error", version: "", url: "" });
    }
  }
}
