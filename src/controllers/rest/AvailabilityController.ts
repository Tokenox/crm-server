import { Controller, Inject } from "@tsed/di";
import { Delete, Enum, Get, Post, Property, Required, Returns } from "@tsed/schema";
import { AdminService } from "../../services/AdminService";
import { AvailabilityResultModel, IdModel, SuccessMessageModel } from "../../models/RestModels";
import { Pagination, SuccessArrayResult, SuccessResult } from "../../util/entities";
import { ADMIN } from "../../util/constants";
import { BodyParams, Context, PathParams } from "@tsed/platform-params";
import { Unauthorized } from "@tsed/exceptions";
import { ADMIN_NOT_FOUND, ORG_NOT_FOUND } from "../../util/errors";
import { AvailabilityService } from "../../services/AvailabilityService";
import { normalizeData } from "../../helper";

class AvailabilityBodyTypes {
  @Property() public readonly startDate: string;
  @Property() public readonly endDate: string;
}

@Controller("/availability")
export class AvailabilityController {
  @Inject() private adminService: AdminService;
  @Inject() private availabilityService: AvailabilityService;

  @Get()
  @Returns(200, SuccessArrayResult).Of(Pagination).Nested(AvailabilityResultModel)
  public async getAvailability(@Context() context: Context) {
    await this.adminService.checkPermissions({ hasRole: [ADMIN] }, context.get("user"));
    const availability = await this.availabilityService.findAvailability();
    const availabilityData = normalizeData(availability);
    return new SuccessResult(new Pagination(availabilityData, availability.length, AvailabilityResultModel), Pagination);
  }

  @Post()
  @Returns(200, SuccessResult).Of(AvailabilityResultModel)
  public async createAvailability(@BodyParams() body: AvailabilityBodyTypes, @Context() context: Context) {
    const { adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN] }, context.get("user"));
    if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
    const { startDate, endDate } = body;
    const response = await this.availabilityService.createAvailability({
      startDate,
      endDate,
      adminId
    });
    const result = {
      _id: response._id,
      startDate: response.startDate.toString(),
      endDate: response.endDate.toString(),
      adminId: response.adminId
    };
    return new SuccessResult(result, AvailabilityResultModel);
  }

  @Delete("/:id")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async deleteAvailability(@PathParams() { id }: IdModel, @Context() context: Context) {
    const { adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN] }, context.get("user"));
    if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
    await this.availabilityService.deleteAvailability(id);
    return new SuccessResult({ success: true, message: "Timeslot deleted successfully" }, SuccessMessageModel);
  }
}
