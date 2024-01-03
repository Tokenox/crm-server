import { Schema } from "@tsed/mongoose";
import { createSchema } from "../helper";

export const plannerModel = createSchema({
  tableName: "planners",
  columns: [
    { name: "title", type: "string" },
    { name: "action", type: "string" },
    { name: "description", type: "string" },
    { name: "timeOfExecution", type: "string" },
    { name: "startDate", type: "string" },
    { name: "orgId", type: "string" },
    { name: "adminId", type: "string" },
    { name: "source", type: "string" },
    { name: "categoryId", type: "string" }
  ]
});

export const categoryModel = createSchema({
  tableName: "categories",
  columns: [
    { name: "name", type: "string" },
    { name: "description", type: "string" },
    { name: "fields", type: "array" },
    { name: "adminId", type: "string" },
    { name: "orgId", type: "string" }
  ]
});
