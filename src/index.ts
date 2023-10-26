import express from "express";
import { PlatformBuilder } from "@tsed/common";
import { PlatformExpress } from "@tsed/platform-express";
import { Server } from "./Server";
import mongoose from "mongoose";
import { Secrets } from "./util/secrets";

export class Application {
  private app: express.Application;
  private platform: PlatformBuilder;
  public databaseConnection: any;

  public async initializeServer() {
    await Secrets.initialize();
    // establish database connection with mongoose.connect()
    this.databaseConnection = await mongoose.connect(
      "mongodb+srv://raza8r:4KZT2u8i88lOxYNj@crm-cluster.bl1i8v3.mongodb.net/?retryWrites=true&w=majority"
    );

    try {
      this.app = express();
      this.platform = await PlatformExpress.bootstrap(Server, {
        express: { app: this.app }
      });
    } catch (error) {
      console.log(error);
    }
  }

  public async startServer() {
    try {
      await this.platform.listen();
      console.log("Server started...");
    } catch (error) {
      console.log(error);
    }
  }
}

(async () => {
  const application = new Application();
  await application.initializeServer();
  await application.startServer();
})();
