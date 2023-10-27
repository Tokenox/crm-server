import { Controller, Inject } from "@tsed/di";
import { BadRequest } from "@tsed/exceptions";
import { BodyParams, Context, PathParams, QueryParams } from "@tsed/platform-params";
import { Delete, Get, Post, Property, Put, Required, Returns } from "@tsed/schema";
import { AdminService } from "../../services/AdminService";
import { ORG_NOT_FOUND } from "../../util/errors";
import { ADMIN, MANAGER } from "../../util/constants";
import { SuccessArrayResult, SuccessResult } from "../../util/entities";
import { LeadService } from "../../services/LeadService";
import { IdModel, LeadResultModel, SuccessMessageModel } from "../../models/RestModels";

class LeadBodyParam {
  @Required() public firstName: string;
  @Property() public lastName: string;
  @Required() public email: string;
  @Required() public phone: string;
  @Required() public categoryId: string;
}

@Controller("/lead")
export class LeadController {
  @Inject()
  private adminService: AdminService;
  @Inject()
  private leadService: LeadService;

  @Get("/")
  @Returns(200, SuccessArrayResult).Of(LeadResultModel)
  public async getLeads(@Context() context: Context) {
    const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
    if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
    const leads = await this.leadService.findLeadsByOrgId(orgId);
    return new SuccessArrayResult(leads, Object);
  }

  @Get("/:id")
  @Returns(200, SuccessResult).Of(LeadResultModel)
  public async getLead(@PathParams() { id }: IdModel, @Context() context: Context) {
    const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
    if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
    const lead = await this.leadService.findLeadById(id);
    return new SuccessResult(
      {
        _id: lead?._id,
        firstName: lead?.firstName,
        lastName: lead?.lastName,
        email: lead?.email,
        phone: lead?.phone,
        categoryId: lead?.categoryId,
        orgId: lead?.orgId,
        createdAt: lead?.createdAt,
        updatedAt: lead?.updatedAt
      },
      LeadResultModel
    );
  }

  @Post("/")
  @Returns(200, SuccessResult).Of(LeadResultModel)
  public async createLead(@BodyParams() body: LeadBodyParam, @Context() context: Context) {
    const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
    if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
    const lead = await this.leadService.createLead({ ...body, orgId });
    return new SuccessResult(
      {
        _id: lead?._id,
        firstName: lead?.firstName,
        lastName: lead?.lastName,
        email: lead?.email,
        phone: lead?.phone,
        categoryId: lead?.categoryId,
        orgId: lead?.orgId,
        createdAt: lead?.createdAt,
        updatedAt: lead?.updatedAt
      },
      LeadResultModel
    );
  }

  @Post("/bulk")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async createBulkLeads(@BodyParams() body: LeadBodyParam[], @Context() context: Context) {
    const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
    if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
    const leads = await this.leadService.createBulkLeads({ body, orgId });
    return new SuccessResult({ success: true, message: `leads created successfully` }, SuccessMessageModel);
  }

  @Put()
  @Returns(200, SuccessResult).Of(LeadResultModel)
  public async updateLead(@BodyParams() body: IdModel & LeadBodyParam, @Context() context: Context) {
    const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
    if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
    const lead = await this.leadService.updateLead({ ...body });
    return new SuccessResult(
      {
        _id: lead?._id,
        firstName: lead?.firstName,
        lastName: lead?.lastName,
        email: lead?.email,
        phone: lead?.phone,
        categoryId: lead?.categoryId,
        orgId: lead?.orgId,
        createdAt: lead?.createdAt,
        updatedAt: lead?.updatedAt
      },
      LeadResultModel
    );
  }

  @Delete("/:id")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async deleteLead(@PathParams() { id }: IdModel, @Context() context: Context) {
    const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, MANAGER] }, context.get("user"));
    if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
    await this.leadService.deleteLead(id);
    return new SuccessResult({ success: true, message: "Lead deleted successfully" }, SuccessMessageModel);
  }
}
