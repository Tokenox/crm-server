import { Controller, Inject } from "@tsed/di";
import { Enum, Get, Post, Property, Required, Returns } from "@tsed/schema";
import { AdminService } from "../../services/AdminService";
import { PlannerResultModel } from "../../models/RestModels";
import { Pagination, SuccessArrayResult, SuccessResult } from "../../util/entities";
import { ADMIN } from "../../util/constants";
import { BodyParams, Context } from "@tsed/platform-params";
import { NotFound, Unauthorized } from "@tsed/exceptions";
import { ADMIN_NOT_FOUND, CATEGORY_NOT_FOUND, ORG_NOT_FOUND } from "../../util/errors";
import { PlannerService } from "../../services/PlannerService";
import { SocialAction } from "../../../types";
import { normalizeData } from "../../helper";
import { CategoryService } from "../../services/CategoryService";

class PlannerBodyTypes {
  @Required() public readonly title: string;
  @Required() @Enum(SocialAction) public readonly action: SocialAction;
  @Property() public readonly description: string;
  @Property() public readonly startDate: string;
  // @Property() public readonly endDate: string;
  @Required() public readonly timeOfExecution: string;
  @Required() public readonly source: string;
}

@Controller("/planner")
export class PlannerController {
  @Inject() private adminService: AdminService;
  @Inject() private plannerService: PlannerService;
  @Inject() private categoryService: CategoryService;

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
    const { title, action, description, startDate, timeOfExecution, source } = body;
    const category = await this.categoryService.findCategoryByName(source.toLocaleLowerCase());
    if (!category) throw new NotFound(CATEGORY_NOT_FOUND);
    const response = await this.plannerService.createPlanner({
      title,
      action,
      description,
      startDate,
      timeOfExecution,
      orgId,
      adminId,
      categoryId: category._id
    });
    const result = {
      _id: response._id,
      title: response.title,
      action: response.action,
      description: response.description,
      startDate: response.startDate.toString(),
      timeOfExecution: response.timeOfExecution.toString(),
      adminId: response.adminId,
      categoryId: response.categoryId
    };
    return new SuccessResult(result, PlannerResultModel);
  }
}
