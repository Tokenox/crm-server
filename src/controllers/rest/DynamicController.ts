import { Controller, Inject } from "@tsed/di";
import { BodyParams, Context, PathParams } from "@tsed/platform-params";
import { Delete, Get, Post, Property, Put, Required, Returns } from "@tsed/schema";
import { Schema, model } from "mongoose";
import { AdminService } from "../../services/AdminService";
import { LeadService } from "../../services/LeadService";
import { createSchema, getColumns, normalizeData } from "../../helper";
import { CategoryService } from "../../services/CategoryService";
import { ADMIN, MANAGER } from "../../util/constants";
import { BadRequest } from "@tsed/exceptions";
import { ADMIN_NOT_FOUND, CATEGORY_ALREADY_EXISTS, CATEGORY_NOT_FOUND, ORG_NOT_FOUND } from "../../util/errors";
import { SuccessResult } from "../../util/entities";

// fields types

class InsertModelBodyParams {
  @Required() public tableName: string;
  @Required() public fields: any;
  @Required() public data: any;
}

class CreateLeadWebhookBodyParams {
  @Property() public lead: any;
  @Property() public source: string;
}

@Controller("/dynamic")
export class DynamicController {
  @Inject()
  private adminService: AdminService;
  @Inject()
  private categoryServices: CategoryService;
  @Inject()
  private categoryService: CategoryService;

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
    const { tableId, data } = modelData;
    const category = await this.categoryServices.findCategoryById(tableId);
    if (!category) throw new BadRequest(CATEGORY_NOT_FOUND);
    const dynamicModel = createSchema({ tableName: category.name, columns: category.fields });

    const newRecord = new dynamicModel({
      ...data,
      isNotify: false,
      category: category?._id,
      orgId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const response = await newRecord.save();
    return new SuccessResult(response, Object);
  }

  @Put("/update")
  @Returns(200, SuccessResult).Of(Object)
  async updateDynamicModel(@BodyParams() modelData: any, @Context() context: Context) {
    await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
    const { tableId, data } = modelData;
    const category = await this.categoryServices.findCategoryById(tableId);
    if (!category) throw new BadRequest(CATEGORY_NOT_FOUND);
    const dynamicModel = createSchema({ tableName: category.name, columns: category.fields });
    const result = await dynamicModel.updateOne({ _id: data.id }, { $set: { ...data, isNotify: false, updatedAt: new Date() } });
    return new SuccessResult(result, Object);
  }

  @Post("/createBulk")
  @Returns(200, SuccessResult).Of(Object)
  async insertManyDynamicModel(@BodyParams() body: any, @Context() context: Context) {
    const { tableName, fields, data } = body;
    console.log("tableName", tableName, fields, data);
    const { orgId, email } = await this.adminService.checkPermissions(
      { hasRole: [ADMIN, MANAGER, "CRM System Administrator"] },
      context.get("user")
    );
    if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
    const admin = await this.adminService.findAdminByEmail(email!);
    if (!admin) throw new BadRequest(ADMIN_NOT_FOUND);
    let category = await this.categoryServices.findCategoryByNameAndOrgId({ name: tableName, orgId });
    if (category) throw new BadRequest(CATEGORY_ALREADY_EXISTS);
    category = await this.categoryService.createCategory({
      name: tableName,
      description: "Dynamic Table Name",
      fields,
      orgId,
      adminId: admin._id
    });
    const dynamicModel = createSchema({ tableName: category.name, columns: category.fields });
    const formattedData = data?.map((item: any) => {
      return {
        ...item,
        orgId,
        isNotify: false,
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

  @Get("/id")
  async getDynamicModelById(@BodyParams() modelData: any) {
    const { tableName, columns, id } = modelData;
    const dynamicModel = createSchema({ tableName, columns });
    const result = await dynamicModel.findById(id);
    return result;
  }

  @Post("/delete/:id")
  async deleteDynamicModelById(@BodyParams() { tableId }: { tableId: string }, @PathParams("id") id: string, @Context() context: Context) {
    await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
    const category = await this.categoryServices.findCategoryById(tableId);
    if (!category) throw new BadRequest(CATEGORY_NOT_FOUND);
    const dynamicModel = createSchema({ tableName: category.name, columns: category.fields });
    const result = await dynamicModel.findByIdAndDelete(id);
    return new SuccessResult(result, Object);
  }

  @Post("/webhook/lead")
  async createWebhookLead(@BodyParams() { source, lead }: CreateLeadWebhookBodyParams) {
    let category = await this.categoryServices.findCategoryByName(source.toLocaleLowerCase());
    const fields = getColumns(lead);
    if (!category) {
      // create category
      category = await this.categoryServices.createCategory({
        name: source.toLocaleLowerCase(),
        fields,
        description: "Create category from webhook"
      });
    }
    const dynamicModel = createSchema({ tableName: source.toLocaleLowerCase(), columns: fields });
    const newRecord = new dynamicModel({
      ...lead,
      category: category?._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const response = await newRecord.save();
    return new SuccessResult(response, Object);
  }
}
