import { Controller, Inject } from "@tsed/di";
import { BadRequest, Unauthorized } from "@tsed/exceptions";
import { BodyParams, Context, PathParams, QueryParams } from "@tsed/platform-params";
import { Delete, Get, Post, Property, Put, Required, Returns } from "@tsed/schema";
import { AdminService } from "../../services/AdminService";
import { ADMIN_NOT_FOUND, SALE_REP_NOT_FOUND } from "../../util/errors";
import { ADMIN, MANAGER, SALESREP } from "../../util/constants";
import { Pagination, SuccessArrayResult, SuccessResult } from "../../util/entities";
import { LeadService } from "../../services/LeadsService";
import { IdModel, LeadResultModel, SuccessMessageModel } from "../../models/RestModels";
import { normalizeData, normalizeObject } from "../../helper";
import { SaleRepService } from "../../services/SaleRepService";
import { LeadStatusEnum } from "../../../types";

class LeadBodyParam {
  @Required() public firstName: string;
  @Property() public lastName: string;
  @Required() public email: string;
  @Required() public phone: string;
  @Required() public categoryId: string;
}

export class PaginationParams {
  @Property() public skip: number;
  @Property() public take: number;
  @Property() public search: string;
  @Property() public sort: "asc" | "desc";
}

@Controller("/lead")
export class LeadController {
  @Inject()
  private adminService: AdminService;
  @Inject()
  private leadService: LeadService;
  @Inject()
  private saleRepService: SaleRepService;

  @Get("/all")
  @Returns(200, SuccessResult).Of(LeadResultModel)
  public async getAllLeads(@QueryParams() { skip, take, search, sort }: PaginationParams, @Context() context: Context) {
    const { adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN] }, context.get("user"));
    if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
    const leads = await this.leadService.findLeads({ skip, take, search, sort });
    const leadCount = await this.leadService.getLeadsCount();
    return new SuccessResult(new Pagination(normalizeData(leads), leadCount, LeadResultModel), Pagination);
  }

  @Get("/claim")
  @Returns(200, SuccessResult).Of(LeadResultModel)
  public async getClaimLeads(@Context() context: Context) {
    const { adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, SALESREP] }, context.get("user"));
    if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
    const saleRep = await this.saleRepService.findSaleRepByAdminId(adminId);
    if (!saleRep) throw new BadRequest(SALE_REP_NOT_FOUND);
    const leads = await this.leadService.findLeadByStatusAndRep({ status: LeadStatusEnum.open, saleRepId: saleRep._id });
    return new SuccessResult(normalizeData(leads), LeadResultModel);
  }

  @Get("/:source")
  @Returns(200, SuccessResult).Of(LeadResultModel)
  public async getLeadsBySource(
    @PathParams() { source }: { source: string },
    @QueryParams() { skip, take, search, sort }: PaginationParams,
    @Context() context: Context
  ) {
    const { adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, SALESREP] }, context.get("user"));
    if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
    const saleRep = await this.saleRepService.findSaleRepByAdminId(adminId);
    if (!saleRep) throw new BadRequest(SALE_REP_NOT_FOUND);
    const leads = await this.leadService.findLeadsBySource({
      saleRepId: saleRep._id,
      status: LeadStatusEnum.claim,
      source,
      skip,
      take,
      search,
      sort
    });
    return new SuccessResult(new Pagination(normalizeData(leads.leads), leads.count, LeadResultModel), Pagination);
  }

  @Post("/claim")
  @Returns(200, SuccessResult).Of(LeadResultModel)
  public async claimLead(@BodyParams() { id }: IdModel, @Context() context: Context) {
    const { adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, SALESREP] }, context.get("user"));
    if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
    const response = await this.leadService.updateLeadStatus({ id, status: LeadStatusEnum.claim });
    await this.saleRepService.deleteLeadId(id);
    return new SuccessResult(normalizeObject(response), LeadResultModel);
  }

  // @Get("/")
  // @Returns(200, SuccessArrayResult).Of(LeadResultModel)
  // public async getLeads(@Context() context: Context) {
  //   const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
  //   if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
  //   const leads = await this.leadService.findLeadsByOrgId(orgId);
  //   return new SuccessArrayResult(leads, Object);
  // }

  // @Get("/:id")
  // @Returns(200, SuccessResult).Of(LeadResultModel)
  // public async getLead(@PathParams() { id }: IdModel, @Context() context: Context) {
  //   const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
  //   if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
  //   const lead = await this.leadService.findLeadById(id);
  //   return new SuccessResult(
  //     {
  //       _id: lead?._id,
  //       firstName: lead?.firstName,
  //       lastName: lead?.lastName,
  //       email: lead?.email,
  //       phone: lead?.phone,
  //       categoryId: lead?.categoryId,
  //       orgId: lead?.orgId,
  //       createdAt: lead?.createdAt,
  //       updatedAt: lead?.updatedAt
  //     },
  //     LeadResultModel
  //   );
  // }

  // @Post("/")
  // @Returns(200, SuccessResult).Of(LeadResultModel)
  // public async createLead(@BodyParams() body: LeadBodyParam, @Context() context: Context) {
  //   const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
  //   if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
  //   const { email } = body;
  //   const emailCheck = await this.leadService.findLeadsByName(email);
  //   if (emailCheck) throw new BadRequest(EMAIL_EXISTS);
  //   const lead = await this.leadService.createLead({ ...body, orgId });
  //   return new SuccessResult(
  //     {
  //       _id: lead?._id,
  //       firstName: lead?.firstName,
  //       lastName: lead?.lastName,
  //       email: lead?.email,
  //       phone: lead?.phone,
  //       categoryId: lead?.categoryId,
  //       orgId: lead?.orgId,
  //       createdAt: lead?.createdAt,
  //       updatedAt: lead?.updatedAt
  //     },
  //     LeadResultModel
  //   );
  // }

  // @Post("/bulk")
  // @Returns(200, SuccessResult).Of(SuccessMessageModel)
  // public async createBulkLeads(@BodyParams() body: LeadBodyParam[], @Context() context: Context) {
  //   const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
  //   if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
  //   const [{ email }] = body;
  //   const emailCheck = await this.leadService.findLeadsByName(email);
  //   if (emailCheck) throw new BadRequest(EMAIL_EXISTS);
  //   const leads = await this.leadService.createBulkLeads({ body, orgId });
  //   return new SuccessResult({ success: true, message: `leads created successfully` }, SuccessMessageModel);
  // }

  // @Put()
  // @Returns(200, SuccessResult).Of(LeadResultModel)
  // public async updateLead(@BodyParams() body: IdModel & LeadBodyParam, @Context() context: Context) {
  //   const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
  //   if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
  //   const lead = await this.leadService.updateLead({ ...body });
  //   return new SuccessResult(
  //     {
  //       _id: lead?._id,
  //       firstName: lead?.firstName,
  //       lastName: lead?.lastName,
  //       email: lead?.email,
  //       phone: lead?.phone,
  //       categoryId: lead?.categoryId,
  //       orgId: lead?.orgId,
  //       createdAt: lead?.createdAt,
  //       updatedAt: lead?.updatedAt
  //     },
  //     LeadResultModel
  //   );
  // }

  // @Delete("/:id")
  // @Returns(200, SuccessResult).Of(SuccessMessageModel)
  // public async deleteLead(@PathParams() { id }: IdModel, @Context() context: Context) {
  //   const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
  //   if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
  //   await this.leadService.deleteLead(id);
  //   return new SuccessResult({ success: true, message: "Lead deleted successfully" }, SuccessMessageModel);
  // }
}
