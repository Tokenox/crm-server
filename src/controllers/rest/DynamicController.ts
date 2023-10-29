import { Controller, Inject } from "@tsed/di";
import { BodyParams, Context, PathParams } from "@tsed/platform-params";
import { Delete, Get, Post, Put, Returns } from "@tsed/schema";
import { Schema, model } from "mongoose";
import { AdminService } from "../../services/AdminService";
import { LeadService } from "../../services/LeadService";
import { createSchema, normalizeData } from "../../helper";
import { CategoryService } from "../../services/CategoryService";
import { ADMIN, MANAGER } from "../../util/constants";
import { BadRequest } from "@tsed/exceptions";
import { CATEGORY_ALREADY_EXISTS, CATEGORY_NOT_FOUND } from "../../util/errors";
import { SuccessResult } from "../../util/entities";

@Controller("/dynamic")
export class DynamicController {
  @Inject()
  private adminService: AdminService;
  @Inject()
  private categoryServices: CategoryService;

  @Post("/")
  async createDynamicModel(@BodyParams() modelData: any) {
    //! created schema for tables, which hold the ids of all the tables, we can create schema for that in the models folder and make relation with dynamic schema, model and table name

    const { tableName, columns } = modelData;
    const dynamicModel = createSchema({ tableName, columns });
    return { message: `Model ${tableName} created successfully.` };
  }

  // insert data in dynamic schema and model
  @Post("/insert")
  @Returns(200, SuccessResult).Of(Object)
  async insertDynamicModel(@BodyParams() modelData: any, @Context() context: Context) {
    const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
    const { tableName, columns, data } = modelData;
    const dynamicModel = createSchema({ tableName, columns });

    let category = await this.categoryServices.findCategoryByNameAndOrgId({ name: tableName, orgId });
    if (!category) {
      category = await this.categoryServices.createCategory({ name: tableName, orgId });
    }

    const newRecord = new dynamicModel({
      ...data,
      category: category?._id,
      orgId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const response = await newRecord.save();
    return new SuccessResult(response, Object);
  }

  // create endpoint to insert many records in dynamic schema and model
  @Post("/createBulk")
  @Returns(200, SuccessResult).Of(Object)
  async insertManyDynamicModel(@BodyParams() modelData: any, @Context() context: Context) {
    const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
    const { tableName, columns, data } = modelData;
    const dynamicModel = createSchema({ tableName, columns });

    let category = await this.categoryServices.findCategoryByNameAndOrgId({ name: tableName, orgId });
    if (!category) {
      category = await this.categoryServices.createCategory({ name: tableName, orgId });
    }
    // format data to insert in dynamic schema
    const formattedData = data.map((item: any) => {
      return {
        ...item,
        orgId,
        categoryId: category?._id.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    const response = await dynamicModel.insertMany(formattedData);
    return new SuccessResult(normalizeData(response), Object);
  }

  @Get("/:categoryId")
  @Returns(200, SuccessResult).Of(Object)
  async getDynamicModel(@PathParams("categoryId") categoryId: string, @Context() context: Context) {
    const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
    const category = await this.categoryServices.findCategoryById(categoryId);
    if (!category) throw new BadRequest(CATEGORY_NOT_FOUND);
    const tableName = category.name;
    let dynamicModel;
    try {
      dynamicModel = model(tableName);
    } catch (error) {
      const ProductSchema = new Schema({}, { strict: false });
      dynamicModel = model(tableName, ProductSchema);
    }
    const result = await dynamicModel.find();
    return new SuccessResult(normalizeData(result), Object);
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
