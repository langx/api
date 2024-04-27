import { Request, Response } from "express";
import "dotenv/config";

const env: any = {
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY as string,
  NEWSLETTER_LIST_ID: process.env.NEWSLETTER_LIST_ID as string,
};

export default class MailController {
  async create(req: Request, res: Response) {
    try {
      fetch("https://api.sendgrid.com/v3/marketing/contacts", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          list_ids: [env.NEWSLETTER_LIST_ID],
          contacts: [{ email: "new_subscriber213@example.com" }],
        }),
      }).then((response) => {
        console.log(response);
        if (response.status === 202) {
          console.log("Contact added successfully!");
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
