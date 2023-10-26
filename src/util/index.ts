import crypto from "crypto";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../../types";

const { NODE_ENV = "development" } = process.env;

const serverUrls: { [key: string]: string } = {
  production: "",
  staging: "",
  development: "http://localhost:4000"
};

export const serverBaseUrl = serverUrls[NODE_ENV] || serverUrls["development"];

const { ENCRYPTION_KEY } = process.env;

export const formatFloat = (val?: string | number | null): string => {
  if (!val) {
    return "0";
  }
  if (typeof val === "string") {
    val = parseFloat(val);
  }
  return val === 0 ? "0" : val >= 1 ? val.toFixed(2) : val.toFixed(8);
};

export const generateRandomId = (stringLength = 20) => {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  function pickRandom() {
    return possible[Math.floor(Math.random() * possible.length)];
  }
  return Array.apply(null, Array(stringLength)).map(pickRandom).join("");
};

export const generate6DigitCode = () => {
  const possible = "0123456789";
  const stringLength = 6;
  function pickRandom() {
    return possible[Math.floor(Math.random() * possible.length)];
  }
  return Array.apply(null, Array(stringLength)).map(pickRandom).join("");
};

export const createPasswordHash = (data: { email: string; password: string }) => {
  if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY not set");
  const salt = `${data.email.toLowerCase()}-${ENCRYPTION_KEY}`;
  return crypto.createHmac("sha512", salt).update(data.password).digest("base64");
};

export const createSessionToken = ({ id, email, role }: { id: string; email: string; role: string }): string => {
  const payload: JWTPayload = {
    id,
    email,
    role: role || "admin"
  };
  if (!ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY not set");
  return jwt.sign(payload, ENCRYPTION_KEY, { expiresIn: "7d", audience: serverBaseUrl });
};
