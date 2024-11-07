import nodemailer from "nodemailer";
import fs from "fs";

export const sendEmail = async (
  recipient: string,
  replacements: Map<string, string>
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const subject = "[SAB] Xác nhận đặt trước vật phẩm SAB";
  let text = fs.readFileSync("src/utils/email.txt", "utf8");
  let html = fs.readFileSync("src/utils/email.html", "utf8");

  replacements.forEach((value, key) => {
    text = text.replaceAll(`{{${key}}}`, value);
    html = html.replaceAll(`{{${key}}}`, value);
  });

  return await transporter.sendMail({
    from: process.env.EMAIL,
    to: recipient,
    subject: subject,
    text: text,
    html: html,
  });
};
