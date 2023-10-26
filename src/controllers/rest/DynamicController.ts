import { Controller } from "@tsed/di";
import { BodyParams, PathParams } from "@tsed/platform-params";
import { Delete, Get, Post, Put } from "@tsed/schema";
import { Schema, model, Model } from "mongoose";

@Controller("/dynamic")
export class DynamicController {
  @Post("/")
  async createDynamicModel(@BodyParams() modelData: any) {
    // Extract the table name and column definitions from the request
    const { tableName, columns } = modelData;

    // Define a dynamic schema based on the provided columns
    const schemaDefinition: Record<string, any> = {};
    for (const column of columns) {
      schemaDefinition[column.name] = column.type;
    }
    const schema = new Schema(schemaDefinition);

    // Create a dynamic model based on the schema
    const dynamicModel = model(tableName, schema);

    // You can use dynamicModel to perform operations
    return { message: `Model ${tableName} created successfully.` };
  }

  // insert data in dynamic schema and model
  @Post("/insert")
  async insertDynamicModel(@BodyParams() modelData: any) {
    const { tableName, columns, data } = modelData;

    let dynamicModel;
    try {
      dynamicModel = model(tableName);
    } catch (error) {
      const schemaDefinition: Record<string, any> = {};
      for (const column of columns) {
        schemaDefinition[column.name] = column.type;
      }
      const schema = new Schema(schemaDefinition);
      schema.add({
        adminId: String,
        createdAt: Date,
        updatedAt: Date
      });

      dynamicModel = model(tableName, schema);
    }
    const newRecord = new dynamicModel({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      adminId: "5f9b3b7b9b0b3c2b3c2b3c2b"
    }); // Provide the data
    await newRecord.save();
    return { message: `Model ${newRecord} created successfully.` };
  }

  // get data from dynamic schema and model
  @Get("/")
  async getDynamicModel(@BodyParams() modelData: any) {
    const { tableName, columns } = modelData;

    let dynamicModel;
    try {
      dynamicModel = model(tableName);
    } catch (error) {
      const schemaDefinition: Record<string, any> = {};
      for (const column of columns) {
        schemaDefinition[column.name] = column.type;
      }
      const schema = new Schema(schemaDefinition);
      schema.add({
        adminId: String,
        createdAt: Date,
        updatedAt: Date
      });

      dynamicModel = model(tableName, schema);
    }

    const result = await dynamicModel.find({});
    return result;
  }

  // update data in dynamic schema and model
  @Put("/update")
  async updateDynamicModel(@BodyParams() modelData: any) {
    const { tableName, columns, data, id } = modelData;
    let dynamicModel;
    try {
      dynamicModel = model(tableName);
    } catch (error) {
      const schemaDefinition: Record<string, any> = {};
      for (const column of columns) {
        schemaDefinition[column.name] = column.type;
      }
      const schema = new Schema(schemaDefinition);
      schema.add({
        adminId: String,
        createdAt: Date,
        updatedAt: Date
      });

      dynamicModel = model(tableName, schema);
    }

    const result = await dynamicModel.updateOne({ _id: id }, { $set: { ...data, updatedAt: new Date() } });

    return { message: `Model ${result} updated successfully.` };
  }

  // get data by id from dynamic schema and model
  @Get("/id")
  async getDynamicModelById(@BodyParams() modelData: any) {
    const { tableName, columns, id } = modelData;

    console.log("modelData", modelData);

    let dynamicModel;
    try {
      dynamicModel = model(tableName);
    } catch (error) {
      const schemaDefinition: Record<string, any> = {};
      for (const column of columns) {
        schemaDefinition[column.name] = column.type;
      }
      const schema = new Schema(schemaDefinition);
      schema.add({
        adminId: String,
        createdAt: Date,
        updatedAt: Date
      });

      dynamicModel = model(tableName, schema);
    }

    const result = await dynamicModel.findById(id);
    return result;
  }

  // delete data by id from dynamic schema and model
  @Delete("/delete")
  async deleteDynamicModelById(@BodyParams() modelData: any) {
    const { tableName, columns, id } = modelData;

    console.log("modelData", modelData);

    let dynamicModel;
    try {
      dynamicModel = model(tableName);
    } catch (error) {
      const schemaDefinition: Record<string, any> = {};
      for (const column of columns) {
        schemaDefinition[column.name] = column.type;
      }
      const schema = new Schema(schemaDefinition);
      schema.add({
        adminId: String,
        createdAt: Date,
        updatedAt: Date
      });

      dynamicModel = model(tableName, schema);
    }
    const result = await dynamicModel.findByIdAndDelete(id);
    return result;
  }
}
