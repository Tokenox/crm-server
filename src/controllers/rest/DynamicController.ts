// import { Controller, Inject } from "@tsed/di";
// import { BodyParams, Context, PathParams, QueryParams } from "@tsed/platform-params";
// import { Delete, Get, Post, Property, Put, Required, Returns } from "@tsed/schema";
// import { Schema, model } from "mongoose";
// import { AdminService } from "../../services/AdminService";
// import { LeadService } from "../../services/LeadsService";
// import { createSchema, getColumns, normalizeData } from "../../helper";
// import { CategoryService } from "../../services/CategoryService";
// import { ADMIN, MANAGER } from "../../util/constants";
// import { BadRequest, Unauthorized } from "@tsed/exceptions";
// import { ADMIN_NOT_FOUND, CATEGORY_ALREADY_EXISTS, CATEGORY_NOT_FOUND, ORG_NOT_FOUND } from "../../util/errors";
// import { Pagination, SuccessArrayResult, SuccessResult } from "../../util/entities";
// import { LeadStatusEnum } from "../../../types";
// import { AvailabilityService } from "../../services/AvailabilityService";
// import { SaleRepService } from "../../services/SaleRepService";
// import { LeadModel } from "../../models/LeadModel";
// import { AllLeadsResultModel } from "../../models/RestModels";

// // fields types

// class InsertModelBodyParams {
//   @Required() public tableName: string;
//   @Required() public fields: any;
//   @Required() public data: any;
// }

// class CreateLeadWebhookBodyParams {
//   @Property() public lead: any;
//   @Property() public source: string;
// }

// @Controller("/dynamic")
// export class DynamicController {
//   @Inject()
//   private adminService: AdminService;
//   @Inject()
//   private categoryServices: CategoryService;
//   @Inject()
//   private categoryService: CategoryService;
//   @Inject()
//   private leadsService: LeadService;
//   @Inject()
//   private availabilityService: AvailabilityService;
//   @Inject()
//   private saleRepService: SaleRepService;

//   @Post("/")
//   async createDynamicModel(@BodyParams() modelData: any) {
//     //! created schema for tables, which hold the ids of all the tables, we can create schema for that in the models folder and make relation with dynamic schema, model and table name

//     const { tableName, columns } = modelData;
//     const dynamicModel = createSchema({ tableName, columns });
//     return { message: `Model ${tableName} created successfully.` };
//   }

//   // insert data in dynamic schema and model
//   @Post("/insert")
//   @Returns(200, SuccessResult).Of(Object)
//   async insertDynamicModel(@BodyParams() modelData: any, @Context() context: Context) {
//     const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
//     const { tableId, data } = modelData;
//     const category = await this.categoryServices.findCategoryById(tableId);
//     if (!category) throw new BadRequest(CATEGORY_NOT_FOUND);
//     const dynamicModel = createSchema({ tableName: category.name, columns: category.fields });

//     const newRecord = new dynamicModel({
//       ...data,
//       categoryId: category?._id,
//       orgId,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     });
//     const response = await newRecord.save();
//     return new SuccessResult(response, Object);
//   }

//   @Put("/update")
//   @Returns(200, SuccessResult).Of(Object)
//   async updateDynamicModel(@BodyParams() modelData: any, @Context() context: Context) {
//     await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
//     const { tableId, data } = modelData;
//     const category = await this.categoryServices.findCategoryById(tableId);
//     if (!category) throw new BadRequest(CATEGORY_NOT_FOUND);
//     const dynamicModel = createSchema({ tableName: category.name, columns: category.fields });
//     const result = await dynamicModel.updateOne({ _id: data.id }, { $set: { ...data, isNotify: false, updatedAt: new Date() } });
//     return new SuccessResult(result, Object);
//   }

//   @Post("/createBulk")
//   @Returns(200, SuccessResult).Of(Object)
//   async insertManyDynamicModel(@BodyParams() body: any, @Context() context: Context) {
//     const { tableName, fields, data } = body;
//     console.log("tableName", tableName, fields, data);
//     const { orgId, email } = await this.adminService.checkPermissions(
//       { hasRole: [ADMIN, MANAGER, "CRM System Administrator"] },
//       context.get("user")
//     );
//     if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
//     const admin = await this.adminService.findAdminByEmail(email!);
//     if (!admin) throw new BadRequest(ADMIN_NOT_FOUND);
//     let category = await this.categoryServices.findCategoryByNameAndOrgId({ name: tableName, orgId });
//     if (category) throw new BadRequest(CATEGORY_ALREADY_EXISTS);
//     category = await this.categoryService.createCategory({
//       name: tableName,
//       description: "Dynamic Table Name",
//       fields,
//       orgId,
//       adminId: admin._id
//     });
//     const dynamicModel = createSchema({ tableName: category.name, columns: category.fields });
//     const formattedData = data?.map((item: any) => {
//       return {
//         ...item,
//         orgId,
//         isNotify: false,
//         categoryId: category?._id.toString(),
//         createdAt: new Date(),
//         updatedAt: new Date()
//       };
//     });
//     const response = await dynamicModel.insertMany(formattedData);
//     return new SuccessResult(normalizeData(response), Object);
//   }

//   @Get("/:categoryId")
//   @Returns(200, SuccessResult).Of(Object)
//   async getDynamicModel(@PathParams("categoryId") categoryId: string, @Context() context: Context) {
//     const { orgId, adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
//     const category = await this.categoryServices.findCategoryById(categoryId);
//     if (!category) throw new BadRequest(CATEGORY_NOT_FOUND);
//     const tableName = category.name;
//     // let dynamicModel;
//     // try {
//     //   dynamicModel = model(tableName);
//     // } catch (error) {
//     //   const ProductSchema = new Schema({}, { strict: false });
//     //   dynamicModel = model(tableName, ProductSchema);
//     // }
//     // const lead = await dynamicModel.find();
//     const dynamicModel = createSchema({ tableName: category.name, columns: category.fields });
//     const result = await dynamicModel.find({
//       status: LeadStatusEnum.claim,
//       adminId: adminId
//     });
//     return new SuccessResult(normalizeData(result), Object);
//   }

//   @Get("/id")
//   async getDynamicModelById(@BodyParams() modelData: any) {
//     const { tableName, columns, id } = modelData;
//     const dynamicModel = createSchema({ tableName, columns });
//     const result = await dynamicModel.findById(id);
//     return result;
//   }

//   @Post("/delete/:id")
//   async deleteDynamicModelById(@BodyParams() { tableId }: { tableId: string }, @PathParams("id") id: string, @Context() context: Context) {
//     await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
//     const category = await this.categoryServices.findCategoryById(tableId);
//     if (!category) throw new BadRequest(CATEGORY_NOT_FOUND);
//     const dynamicModel = createSchema({ tableName: category.name, columns: category.fields });
//     const result = await dynamicModel.findByIdAndDelete(id);
//     return new SuccessResult(result, Object);
//   }

//   @Post("/webhook/lead")
//   async createWebhookLead(@BodyParams() { source, lead }: CreateLeadWebhookBodyParams) {
//     // find sale rep based on availability and 15 min duration and score of sale rep

//     let category = await this.categoryServices.findCategoryByName(source.toLocaleLowerCase());
//     const fields = getColumns(lead);
//     if (!category) {
//       // create category
//       category = await this.categoryServices.createCategory({
//         name: source.toLocaleLowerCase(),
//         fields,
//         description: "Create category from webhook"
//       });
//     }
//     const dynamicModel = createSchema({ tableName: source.toLocaleLowerCase(), columns: fields });
//     const newRecord = new dynamicModel({
//       ...lead,
//       isNotify: false,
//       status: LeadStatusEnum.open,
//       categoryId: category?._id,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     });
//     const response = await newRecord.save();

//     const salesRep = await this.saleRepService.findSaleRepBySourceAvailability();
//     let isAssigned = false;
//     if (salesRep) {
//       const createLead = await this.leadsService.createLead({
//         source: source.toLocaleLowerCase(),
//         status: LeadStatusEnum.open,
//         leadId: response._id,
//         categoryId: category._id,
//         adminId: salesRep.adminId
//       });
//       const updateSaleRep = await this.saleRepService.updateSaleRep({
//         id: salesRep._id,
//         leadId: createLead._id
//       });
//       if (updateSaleRep) isAssigned = true;
//     }
//     return new SuccessResult({ isAssigned }, Object);
//   }

//   // claim lead
//   @Post("/claim/lead")
//   @Returns(200, SuccessResult).Of(Object)
//   async claimLead(@BodyParams() { sourceId, leadId, id }: { sourceId: string; leadId: string; id: string }, @Context() context: Context) {
//     const { adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
//     if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
//     const category = await this.categoryServices.findCategoryById(sourceId);
//     if (!category) throw new BadRequest(CATEGORY_NOT_FOUND);
//     const dynamicModel = createSchema({ tableName: category.name, columns: category.fields });
//     // update lead status to claim
//     const response = await dynamicModel.updateOne(
//       { _id: id },
//       { $set: { status: LeadStatusEnum.claim, adminId: adminId, updatedAt: new Date() } }
//     );
//     await this.leadsService.updateLeadStatus({ leadId: leadId, status: LeadStatusEnum.claim, adminId });
//     return new SuccessResult(response, Object);
//   }

//   // get leads for claim
//   @Get("/claim/leads")
//   @Returns(200, SuccessResult).Of(Object)
//   async getClaimLeads(@Context() context: Context) {
//     console.log("claim-leads--------------------------------------");
//     const { adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
//     if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
//     const allLeads = await this.leadsService.getOpenLeadsByAdminId({ adminId, status: LeadStatusEnum.open });
//     console.log("allLeads--------------------------------------", allLeads);
//     // query for all the leads which are not claimed and status is open without category directly from lead model
//     // let filteredLeads: any = [];
//     const filterLeadFun = async (allLeads: LeadModel[]) => {
//       let filteredLeads: any = [];
//       for (let i = 0; i < allLeads.length; i++) {
//         const lead = allLeads[i];
//         const salesRep = await this.saleRepService.findSaleRepBySourceAvailabilityByLeadId(lead.leadId);
//         console.log("salesRep--------------------------------------", salesRep);
//         if (!salesRep) return;
//         const category = await this.categoryServices.findCategoryById(lead.categoryId);
//         if (!category) return;
//         let dynamicModel;
//         try {
//           dynamicModel = model(category.name);
//         } catch (error) {
//           const schema = new Schema({}, { strict: false });
//           dynamicModel = model(category.name, schema);
//         }
//         const response = await dynamicModel.find({ _id: lead.leadId });

//         filteredLeads = [...filteredLeads, { ...response[0]._doc, adminId: salesRep[0]._id, source: lead.source, leadId: lead._id }];
//       }
//       return filteredLeads;
//     };
//     const result = await filterLeadFun(allLeads);
//     console.log("result--------------------------------------", result);

//     // console.log("filteredLeads--------------------------------------", filteredLeads);
//     return new SuccessResult(result, Object);
//   }

//   // after 15 minutes lead will go to next sale rep if first not claimed
//   @Post("/claim/lead/next")
//   @Returns(200, SuccessResult).Of(Object)
//   async claimNextLead(@Context() context: Context) {
//     // find lead which are not claimed and status is open
//     const leads = await this.leadsService.getOpenLeads({ status: LeadStatusEnum.open });
//     console.log("leads--------------------------------------**", leads);
//     if (!leads.length) return;
//     // now assign these leads to that sale rep
//     const updateLeads = async (leads: LeadModel[]) => {
//       let updatedLeads: any = [];
//       for (let i = 0; i < leads.length; i++) {
//         const lead = leads[i];
//         // console.log("lead---------", lead)
//         const saleRep = await this.saleRepService.findSaleRepByLeadId(lead._id);
//         if (!saleRep) return;
//         console.log("saleRep---------", saleRep);
//         // if (!saleRep) {
//         //   await this.leadsService.updateLeadStatus({ leadId: lead._id, status: LeadStatusEnum.open, adminId: "" });
//         //   return updatedLeads.push([]);
//         // }
//         const updateLead = await this.leadsService.updateLead({ leadId: lead._id, adminId: saleRep.adminId });

//         console.log("updateLead--------------------------------------", updateLead);
//         let dynamicModel;
//         try {
//           dynamicModel = model(lead.source.toLocaleLowerCase());
//         } catch (error) {
//           const schema = new Schema({}, { strict: false });
//           dynamicModel = model(lead.source.toLocaleLowerCase(), schema);
//         }
//         const response = await dynamicModel.updateOne(
//           { _id: lead.leadId },
//           { $set: { status: LeadStatusEnum.claim, adminId: saleRep.adminId, updatedAt: new Date() } }
//         );
//         await this.saleRepService.updateSaleRep({
//           id: saleRep._id,
//           leadId: lead._id
//         });
//         console.log("response--------------------------------------", response);
//         updatedLeads = [...updatedLeads, updateLead];
//       }
//       return updatedLeads;
//     };
//     const updatedLeads = await updateLeads(leads);
//     console.log("updatedLeads--------------------------------------", updatedLeads);

//     return new SuccessResult({ success: true, data: updatedLeads }, Object);
//   }

//   // get all lead for super admin
//   @Get("/all/leads")
//   @Returns(200, SuccessResult).Of(Object)
//   async getAllLeads(@QueryParams() { skip, take }: { skip: number; take: number }, @Context() context: Context) {
//     const { adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN] }, context.get("user"));
//     if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
//     const leadCount = await this.leadsService.getLeadsCount();
//     const allLeads = await this.leadsService.getAllLeadsForSuperAdmin({ skip, take });
//     const result = await Promise.all(
//       allLeads.map(async (lead) => {
//         let dynamicModel;
//         try {
//           dynamicModel = model(lead.source.toLocaleLowerCase());
//         } catch (error) {
//           const schema = new Schema({}, { strict: false });
//           dynamicModel = model(lead.source.toLocaleLowerCase(), schema);
//         }
//         const response = await dynamicModel.find({ _id: lead.leadId });
//         const saleRep = await this.adminService.findAdminById(lead.adminId);
//         return {
//           ...response[0]._doc,
//           id: lead._id,
//           adminId: saleRep?._id,
//           saleRep: saleRep?.name,
//           source: lead.source,
//           status: lead.status,
//           leadId: lead._id
//         };
//       })
//     );
//     return new SuccessResult(new Pagination(result, leadCount, AllLeadsResultModel), Pagination);
//   }
// }
