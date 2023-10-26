import { Controller } from "@tsed/di";
import { BodyParams } from "@tsed/platform-params";
import { Delete, Get, Post, Put } from "@tsed/schema";
import { Schema, model } from "mongoose";
import { createSchema } from "../../helper";

@Controller("/dynamic")
export class DynamicController {
  @Post("/")
  async createDynamicModel(@BodyParams() modelData: any) {
    //! created schema for tables, which hold the ids of all the tables, we can create schema for that in the models folder and make relation with dynamic schema, model and table name

    const { tableName, columns } = modelData;
    const dynamicModel = createSchema({ tableName, columns });
    return { message: `Model ${tableName} created successfully.` };
  }

  // insert data in dynamic schema and model
  @Post("/insert")
  async insertDynamicModel(@BodyParams() modelData: any) {
    const { tableName, columns, data } = modelData;
    const dynamicModel = createSchema({ tableName, columns });
    const newRecord = new dynamicModel({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      adminId: "5f9b3b7b9b0b3c2b3c2b3c2b"
    });
    await newRecord.save();
    return { message: `Model ${newRecord} created successfully.` };
  }

  @Get("/")
  async getDynamicModel(@BodyParams() modelData: any) {
    const { tableName, columns } = modelData;
    const dynamicModel = createSchema({ tableName, columns });
    const result = await dynamicModel.find({});
    return result;
  }

  @Put("/update")
  async updateDynamicModel(@BodyParams() modelData: any) {
    const { tableName, columns, data, id } = modelData;
    const dynamicModel = createSchema({ tableName, columns });
    const result = await dynamicModel.updateOne({ _id: id }, { $set: { ...data, updatedAt: new Date() } });
    return { message: `Model ${result} updated successfully.` };
  }

  @Get("/id")
  async getDynamicModelById(@BodyParams() modelData: any) {
    const { tableName, columns, id } = modelData;
    const dynamicModel = createSchema({ tableName, columns });
    const result = await dynamicModel.findById(id);
    return result;
  }

  @Delete("/delete")
  async deleteDynamicModelById(@BodyParams() modelData: any) {
    const { tableName, columns, id } = modelData;
    const dynamicModel = createSchema({ tableName, columns });
    const result = await dynamicModel.findByIdAndDelete(id);
    return result;
  }
}
