import nodemailer from "nodemailer";
import { NodeMailerTypes } from "types";

export class NodemailerClient {
  public static async sendVerificationEmail({ title = "Email", email, code }: NodeMailerTypes) {
    const transporter = nodemailer.createTransport({
      host: "smtp.porkbun.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: `${title} Verification`,
      // text: `Your verification code is ${code}`,
      html: `<p>Your verification code is ${code}</p>
      <p>Thanks</p>`
    };
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) return console.log("Error:(", error);
      if (info?.response) {
        console.log("Email sent:)" + info.response);
        return "Email sent successfully";
      }
    });
  }

  public static async sendCompleteRegistrationEmail({ email }: { email: string; name: string }) {
    const transporter = nodemailer.createTransport({
      host: "smtp.porkbun.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: `Registration Complete`,
      // text: `Your verification code is ${code}`,
      html: `<p>Hi</p>
      <p>Thanks for registering with us.</p>
      'Please verify your account by clicking the link: <a href="'+
      process.env.CLIENT_URL +
      "/verifyemail/"'">here</a>
      <p>Have a great day!</p>`
    };
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) return console.log("Error:(", error);
      if (info?.response) {
        console.log("Email sent:)" + info.response);
        return "Email sent successfully";
      }
    });
  }
}
