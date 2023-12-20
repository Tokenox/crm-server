import { Controller, Inject } from "@tsed/di";
import { Enum, Get, Post, Property, Required, Returns } from "@tsed/schema";
import { AdminService } from "../../services/AdminService";
import { PlannerResultModel } from "../../models/RestModels";
import { Pagination, SuccessArrayResult, SuccessResult } from "../../util/entities";
import { ADMIN } from "../../util/constants";
import { BodyParams, Context } from "@tsed/platform-params";
import { Unauthorized } from "@tsed/exceptions";
import { ADMIN_NOT_FOUND, ORG_NOT_FOUND } from "../../util/errors";
import { PlannerService } from "../../services/PlannerService";
import { SocialAction } from "../../../types";
import { normalizeData } from "../../helper";

class PlannerBodyTypes {
  @Required() public readonly title: string;
  @Required() @Enum(SocialAction) public readonly action: SocialAction;
  @Property() public readonly description: string;
  @Property() public readonly startDate: string;
  @Property() public readonly endDate: string;
  @Required() public readonly timeOfExecution: string;
}

@Controller("/planner")
export class PlannerController {
  @Inject() private adminService: AdminService;
  @Inject() private plannerService: PlannerService;

  @Get()
  @Returns(200, SuccessArrayResult).Of(Pagination).Nested(PlannerResultModel)
  public async getPlanners(@Context() context: Context) {
    await this.adminService.checkPermissions({ hasRole: [ADMIN] }, context.get("user"));
    const planner = await this.plannerService.findPlanner();
    const plannerData = normalizeData(planner);
    return new SuccessResult(new Pagination(plannerData, planner.length, PlannerResultModel), Pagination);
  }

  @Post()
  @Returns(200, SuccessResult).Of(PlannerResultModel)
  public async createPlanner(@BodyParams() body: PlannerBodyTypes, @Context() context: Context) {
    const { orgId, adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN] }, context.get("user"));
    if (!orgId) throw new Unauthorized(ORG_NOT_FOUND);
    if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
    const { title, action, description, startDate, endDate, timeOfExecution } = body;
    const response = await this.plannerService.createPlanner({
      title,
      action,
      description,
      startDate,
      endDate,
      timeOfExecution,
      orgId,
      adminId
    });
    const result = {
      _id: response._id,
      title: response.title,
      action: response.action,
      description: response.description,
      startDate: response.startDate.toString(),
      timeOfExecution: response.timeOfExecution.toString(),
      adminId: response.adminId
    };
    return new SuccessResult(result, PlannerResultModel);
  }

  // cron job to run every 5 minutes
  @Post("/run-job")
  @Returns(200, SuccessResult).Of(Object)
  public async runJob() {
    await this.plannerService.runJob();
    return new SuccessResult("Job run successfully", Object);
  }
}
