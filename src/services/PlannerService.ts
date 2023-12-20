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

  public async createPlanner({ title, action, description, startDate, timeOfExecution, orgId, adminId, endDate }: PlannerDataTypes) {
    return await this.planner.create({
      title,
      action,
      description,
      startDate,
      endDate,
      timeOfExecution,
      orgId,
      adminId
    });
  }

  // cron job to run every 5 minutes
  public async runJob() {
    console.log("service running cron job----------------");
    // find planner with timeOfExecution equal to current time
    const planners = await this.planner.find();
    console.log("planners----------------", planners);
    // if planner is found, run the job send email to all users
    if (planners.length) {
      for (let i = 0; i < planners.length; i++) {
        const planner = planners[i];
        const { title, description, action } = planner;
        // send email to to planner
        console.log("sending email to planner--------------", planner);
        await NodemailerClient.sendEmailToPlanner({ title, email: "raza8r@gmail.com", description, action });
      }
    }
    return "cron job completed"
  }
}
