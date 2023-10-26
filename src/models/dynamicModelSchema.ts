// create dynamic schema and model I have table name and columns array with column name and type

import mongoose from "mongoose";
import { tableName as table2 } from "../controllers/rest/HelloWorldController";

console.log("table2---------------------------------", table2);

const tableName = "your_collection_name";
const columns = [
  { name: "name", type: String },
  { name: "description", type: String },
  { name: "createdDate", type: Date },
  { name: "updatedDate", type: Date }
];

const schema = new mongoose.Schema(
  columns.reduce((acc: any, column) => {
    acc[column.name] = column.type;
    return acc;
  }, {})
);

const model = mongoose.model(tableName, schema);

export const DynamicModel = model;
