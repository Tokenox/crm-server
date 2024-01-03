import { Inject, Injectable } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";
import { NodemailerClient } from "../clients/nodemailer";
import { PlannerDataTypes } from "../../types";
import { PlannerModel } from "../models/PlannerModel";

@Injectable()
export class PlannerService {
  // constructor(@Inject(PlannerModel) private planner: MongooseModel<PlannerModel>) {}
  @Inject(PlannerModel) private planner: MongooseModel<PlannerModel>;

  public async findPlanner() {
    return await this.planner.find();
  }

  public async findPlannerById(id: string) {
    return await this.planner.findById({ _id: id });
  }

  public async createPlanner({ title, action, description, startDate, timeOfExecution, orgId, adminId, categoryId }: PlannerDataTypes) {
    return await this.planner.create({
      title,
      action,
      description,
      startDate,
      timeOfExecution,
      orgId,
      adminId,
      categoryId
    });
  }
}
