// import { promisify } from "util";
// import { readFile } from "fs";

// const readFilePromise = promisify(readFile);

export class Secrets {
  public static encryptionKey: string;

  public static async initialize() {
    Secrets.encryptionKey = process.env.ENCRYPTION_KEY!;
  }
}
