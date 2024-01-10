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

  public static async sendCompleteRegistrationEmail({ email }: { email: string }) {
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
      html: `<p>Registration Complete</p>
      <a href=${process.env.CLIENT_URL}/register/user>Click here to complete registration</a>
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

  public static async sendEmailToLead({ email, title, description }: { email: string; title: string; description: string }) {
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
      subject: `${title}`,
      html: `<p>${description}</p>
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
}
