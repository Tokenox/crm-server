// send twilio programmable sms
import { Twilio } from "twilio";

type SendSMSParam = {
  to: string[];
  body: string;
};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE_NUMBER;

const client = new Twilio(accountSid, authToken);

export class TwilioClient {
  public static async sendSmsToLead({ to, body }: SendSMSParam) {
    for (let i = 0; i < to.length; i++) {
      try {
        const response = await client.messages.create({
          body,
          from,
          to: to[i]
        });
        console.log("Twilio response---", response);
      } catch (error) {
        console.log("Twilio error---", error);
      }
    }
  }
}
