import { Controller, Inject } from "@tsed/di";
import { Delete, Get, Post, Required, Returns } from "@tsed/schema";
import { AdminService } from "../../services/AdminService";
import { AvailabilityResultModel, IdModel, SuccessMessageModel } from "../../models/RestModels";
import { Pagination, SuccessArrayResult, SuccessResult } from "../../util/entities";
import { ADMIN, SALESREP } from "../../util/constants";
import { BodyParams, Context, PathParams } from "@tsed/platform-params";
import { BadRequest, NotFound, Unauthorized } from "@tsed/exceptions";
import { ADMIN_NOT_FOUND, SALE_REP_NOT_FOUND } from "../../util/errors";
import { AvailabilityService } from "../../services/AvailabilityService";
import { normalizeData } from "../../helper";
import { SaleRepService } from "../../services/SaleRepService";

class AvailabilityBodyTypes {
  @Required() public readonly startTime: number;
  @Required() public readonly endTime: number;
}

@Controller("/availability")
export class AvailabilityController {
  @Inject() private adminService: AdminService;
  @Inject() private availabilityService: AvailabilityService;
  @Inject() private saleRepService: SaleRepService;

  @Get()
  @Returns(200, SuccessArrayResult).Of(Pagination).Nested(AvailabilityResultModel)
  public async getAvailability(@Context() context: Context) {
    const { adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, SALESREP] }, context.get("user"));
    if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
    const saleRep = await this.saleRepService.findSaleRepByAdminId(adminId);
    if (!saleRep) throw new BadRequest(SALE_REP_NOT_FOUND);
    const availability = await this.availabilityService.findAvailabilityBySaleRep(saleRep._id);
    const availabilityData = normalizeData(availability);
    return new SuccessResult(new Pagination(availabilityData, availability.length, AvailabilityResultModel), Pagination);
  }

  @Post()
  @Returns(200, SuccessResult).Of(AvailabilityResultModel)
  public async createAvailability(@BodyParams() body: AvailabilityBodyTypes, @Context() context: Context) {
    const { adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, SALESREP] }, context.get("user"));
    if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
    const saleRep = await this.saleRepService.findSaleRepByAdminId(adminId);
    if (!saleRep) throw new NotFound(SALE_REP_NOT_FOUND);
    const { startTime, endTime } = body;
    const response = await this.availabilityService.createAvailability({
      startTime,
      endTime,
      saleRepId: saleRep?._id
    });
    const availability = {
      _id: response._id,
      saleRepId: response.saleRepId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    };
    return new SuccessResult(availability, AvailabilityResultModel);
  }

  @Delete("/:id")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async deleteAvailability(@PathParams() { id }: IdModel, @Context() context: Context) {
    const { adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, SALESREP] }, context.get("user"));
    if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
    await this.availabilityService.deleteAvailability(id);
    return new SuccessResult({ success: true, message: "Timeslot deleted successfully" }, SuccessMessageModel);
  }
}
