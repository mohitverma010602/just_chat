import nodemailer from "nodemailer";
import { ApiError } from "./ApiError.js";

export const sendEmailWithData = async (email, subject, html) => {
  // Create a transporter for SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER_EMAIL,
      pass: process.env.SMTP_EMAIL_PASSWORD,
    },
  });

  console.log(process.env.SMTP_USER_EMAIL, process.env.SMTP_EMAIL_PASSWORD);

  try {
    // Send mail with defined transport object
    await transporter.sendMail({
      from: { name: "Mohit Verma", address: process.env.SMTP_USER_EMAIL },
      to: email,
      subject,
      html,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError("Failed to send email", 502);
  }
};
