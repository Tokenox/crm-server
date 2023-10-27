import { join } from "path";
import { Configuration, Inject } from "@tsed/di";
import { PlatformApplication } from "@tsed/common";
import "@tsed/platform-express"; // /!\ keep this import
import "@tsed/ajv";
import "@tsed/swagger";
import "@tsed/mongoose";
import "passport";
import { config } from "./config/index";
import * as rest from "./controllers/rest/index";
import * as pages from "./controllers/pages/index";
import Http from "http";
import bodyParser from "body-parser";
import { AuthMiddleware } from "./middleware/AuthMiddleware";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";

@Configuration({
  ...config,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8083,
  httpsPort: false, // CHANGE
  disableComponentsScan: true,
  mount: {
    "/rest": [...Object.values(rest)],
    "/": [...Object.values(pages)]
  },
  swagger: [
    {
      path: "/doc",
      specVersion: "3.0.1"
    }
  ],
  middlewares: [
    "cors",
    "cookie-parser",
    "compression",
    "method-override",
    "json-parser",
    { use: "urlencoded-parser", options: { extended: true } }
  ],
  views: {
    root: join(process.cwd(), "../views"),
    extensions: {
      ejs: "ejs"
    }
  },
  exclude: ["**/*.spec.ts"]
})
export class Server {
  @Inject()
  protected app: PlatformApplication;
  @Inject() private server: Http.Server;

  @Configuration()
  protected settings: Configuration;

  /**
   * This method let you configure the express middleware required by your application to works.
   * @returns {Server}
   */
  public $beforeRoutesInit(): void | Promise<any> {
    this.server.timeout = 1000000;
    this.server.keepAliveTimeout = 90000;

    this.app.use(bodyParser.json());
    this.app.use(
      bodyParser.urlencoded({
        extended: true
      })
    );
    this.app.use(AuthMiddleware);
    this.app.use(cors(corsSettings));
    this.app
      .use(cookieParser())
      .use(compression({}))
      .use(bodyParser.json())
      .use(
        bodyParser.urlencoded({
          extended: true
        })
      );

    //   .use(methodOverride())
  }
}

const corsSettings = {
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "Delete", "PATCH", "OPTIONS"],
  exposedHeaders: ["x-auth-token"],
  credentials: true
};
