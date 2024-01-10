import { model, Schema } from "mongoose";
import { SaleRepModel } from "src/models/SaleRepModel";
import { LeadStatusEnum } from "../../types";

export const createSchema = ({ tableName, columns }: { tableName: string; columns: any }) => {
  let dynamicModel;
  try {
    dynamicModel = model(tableName);
  } catch (error) {
    // const isNotify = {
    //   name: "isNotify",
    //   type: "boolean"
    // };
    // const status = {
    //   name: "status",
    //   type: "string",
    //   enum: Object.values(LeadStatusEnum)
    // };

    // const updatedColumn = [...columns, isNotify, status];
    const schemaDefinition: Record<string, any> = {};
    for (const column of columns) {
      schemaDefinition[column.name] = column.type;
    }
    const schema = new Schema(schemaDefinition);
    schema.add({
      isNotify: Boolean,
      status: {
        type: String,
        enum: Object.values(LeadStatusEnum)
      },
      categoryId: String,
      adminId: String,
      orgId: String,
      createdAt: Date,
      updatedAt: Date
    });
    // Create a dynamic model based on the schema
    dynamicModel = model(tableName, schema);
  }
  return dynamicModel;
};

// get columns for raw data
export const getColumns = (data: any) => {
  const columns: any = [];
  const keys = Object?.keys(data);
  keys.forEach((key) => {
    columns.push({
      name: key,
      type: "string"
    });
  });
  return columns;
};

// normalize data
export const normalizeData = (data: any) => {
  const result = data.map((item: any) => {
    const { __v, createdAt, updatedAt, orgId, categoryId, category, ...rest } = item._doc;
    return rest;
  });
  return result;
};

// normalize mongooes object to plain object
export const normalizeObject = (data: any) => {
  const { __v, createdAt, updatedAt, ...rest } = data._doc;
  return rest;
};
