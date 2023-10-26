import { Controller, Inject } from "@tsed/di";
import { BodyParams } from "@tsed/platform-params";
import { Get, Post, Returns } from "@tsed/schema";
import mongoose from "mongoose";
import { OrganizationService } from "../../services/OrganizationService";

interface DynamicTableParams {
  tableName: string;
  columns: any[];
}

export let tableName = "your_collection_name";
export let columns: any;
@Controller("/hello-world")
export class HelloWorldController {
  @Inject() orgService: OrganizationService;

  // @Post("")
  // @Returns(200)
  // public async createDynamicTable() {
  //   const org = await this.orgService.createOrg();
  //   return org;
  // }

  @Post("/dynamic-table")
  @Returns(200)
  public async createDynamicTable(@BodyParams() body: DynamicTableParams) {
    columns = body.columns;
    // save data in dynamic schema and model
    const model1 = mongoose.model("your_collection_name");
    const data = {
      name: "rainmaker 2",
      description: "rainmaker desc 2",
      createdDate: new Date(),
      updatedDate: new Date()
    };

    const doc = await model1.create(data);
    console.log(doc);
  }

  @Get("/dynamic-table")
  @Returns(200)
  public async getDynamicTable() {
    // get data from dynamic schema and model
    const model1 = mongoose.model("your_collection_name");
    const data = await model1.find({});
    console.log(data);
    return data;
  }
}
