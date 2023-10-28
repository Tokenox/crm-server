import { Controller, Inject } from "@tsed/di";
import { BodyParams, Context } from "@tsed/platform-params";
import { Delete, Get, Post, Put, Returns } from "@tsed/schema";
import { Schema, model } from "mongoose";
import { AdminService } from "../../services/AdminService";
import { LeadService } from "../../services/LeadService";
import { createSchema } from "../../helper";
import { CategoryService } from "../../services/CategoryService";
import { ADMIN, MANAGER } from "../../util/constants";
import { BadRequest } from "@tsed/exceptions";
import { CATEGORY_ALREADY_EXISTS } from "../../util/errors";
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

    const category = await this.categoryServices.findCategoryByNameAndOrgId({ name: tableName, orgId });
    if (category) throw new BadRequest(CATEGORY_ALREADY_EXISTS);
    const newCategory = await this.categoryServices.createCategory({ name: tableName, orgId });
    const newRecord = new dynamicModel({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: newCategory?._id
    });
    const response = await newRecord.save();
    return new SuccessResult(response, Object);
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
