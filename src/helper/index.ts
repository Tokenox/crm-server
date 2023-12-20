import { model, Schema } from "mongoose";

export const createSchema = ({ tableName, columns }: { tableName: string; columns: any }) => {
  let dynamicModel;
  try {
    dynamicModel = model(tableName);
  } catch (error) {
    // Define a dynamic schema based on the provided columns
    const schemaDefinition: Record<string, any> = {};
    for (const column of columns) {
      schemaDefinition[column.name] = column.type;
    }
    const schema = new Schema(schemaDefinition);
    schema.add({
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

// normalize data
export const normalizeData = (data: any) => {
  const result = data.map((item: any) => {
    const { __v, createdAt, updatedAt, orgId, categoryId, category, ...rest } = item._doc;
    return rest;
  });
  return result;
};
