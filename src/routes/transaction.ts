import { Router, Request, Response } from "express";
import { Transaction } from "../models/transaction";
import { QuickDB } from "quick.db";
import * as fs from "fs";
import * as path from "path";
import { randomBytes } from "crypto";

const ID_LENGTH = 6;
const router = Router();

const transactionDbPath =
  process.env.TRANSACTION_DB_PATH || "./files/Transactions.sqlite";
const dirPath = path.dirname(transactionDbPath);

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

export const transactionDb = new QuickDB({
  filePath: transactionDbPath,
});
transactionDb.init();

router.post("/", async (req: Request, res: Response) => {
  let orderID = await randomString(ID_LENGTH);
  while (await transactionDb.has(orderID)) {
    orderID = await randomString(ID_LENGTH);
  }
  const currTime = new Date();
  const currTimeStr = currTime.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const isFaild = req.body.isFaild;
  const datetimeCreated = req.body.datetimeCreated ?? currTime.toISOString();
  const info: Transaction = {
    date: isFaild ? datetimeCreated : currTime.toISOString(),
    transactionID: orderID,
    sellerID: req.body.sellerID,
    customerID: req.body.customerID,
    customerName: req.body.customerName,
    combo1: req.body.combo1,
    combo2: req.body.combo2,
    combo3: req.body.combo3,
    combo4: req.body.combo4,
    total: req.body.total,
    payment: req.body.paymentMethod,
    isPreOrder: req.body.isPreOrder,
  };

  const current = new Date();
  // convert to UTC +7 timezone
  current.setHours(current.getHours() + 7);
  transactionDb
    .set(orderID, info)
    .then(() => {
      console.info(`[${currTimeStr}] Order ${orderID} created`);
      // send the object with status code 200 Created
      res.status(200).send(info);
    })
    .catch((e) => {
      console.error(e);
      console.info(info);
      res.status(500).send();
    });
});

router.get("/item/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  transactionDb
    .get(id)
    .then((order) => {
      res.status(200).send(order);
    })
    .catch(() => {
      res.status(500).send();
    });
});

router.get("/sheet", async (req: Request, res: Response) => {
  const auth = req.query.auth as string;
  if (auth !== process.env.AUTH && auth !== "") {
    res.status(401).send();
    return;
  }
  // return all orders in json format
  const orders = await transactionDb.all();
  res.status(200).send(orders);
});

export default router;

function randomString(length) {
  // Bộ ký tự an toàn để sinh random (loại trừ 0, O, 1, I)
  const safeChars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let result = "";
  const charLength = safeChars.length;
  for (let i = 0; i < length; i++) {
    // Sử dụng crypto.randomBytes để tạo số ngẫu nhiên an toàn
    const randomBuffer = randomBytes(1);
    // Chuyển đổi buffer thành số nguyên
    const randomIndex = randomBuffer.readUInt8(0) % charLength;
    result += safeChars[randomIndex];
  }
  return result;
}
