import { Inject, Injectable } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";
import { PlannerModel } from "../models/PlannerModel";
import { SocialAction } from "../../types";

type CreatePlannerParam = {
  title: string;
  source: string;
  action: SocialAction;
  description: string;
  timeOfExecution: number;
  startDate: number;
};

@Injectable()
export class PlannerService {
  @Inject(PlannerModel) private planner: MongooseModel<PlannerModel>;

  //! Find
  public async findPlanner() {
    return await this.planner.find();
  }

  public async findPlannerById(id: string) {
    return await this.planner.findById({ _id: id });
  }

  // find planner by timeOfExecution and startDate, if timeOfExecution is come or past and startDate is today
  public async findPlannerByTime({ socialAction }: { socialAction: SocialAction }) {
    console.log("socialAction-------", socialAction);
    const response = await this.planner.find({
      // find by timeOfExecution is past before 1 hour and current time
      // timeOfExecution: { $lte: new Date().getTime() },
      timeOfExecution: { $lte: new Date().getTime(), $gte: new Date().getTime() - 3600000 },
      //start date is in numbers and now filter by current date in numbers
      startDate: { $lte: new Date().getTime() },
      action: socialAction
    });
    return response;
  }

  //! Create
  public async createPlanner({ title, action, source, description, timeOfExecution, startDate }: CreatePlannerParam) {
    return await this.planner.create({
      title,
      source,
      description,
      action,
      timeOfExecution,
      startDate
    });
  }

  //! Update
  public async updatePlanner({ _id, title, source, description, timeOfExecution, startDate }: PlannerModel) {
    return await this.planner.findByIdAndUpdate(
      { _id },
      {
        title,
        source,
        description,
        timeOfExecution,
        startDate,
        updatedAt: new Date()
      }
    );
  }

  //! Delete
  public async deletePlanner(id: string) {
    return await this.planner.deleteOne({ _id: id });
  }
}
