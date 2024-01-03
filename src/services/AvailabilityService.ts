import { Inject, Injectable } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";
import { AvailabilityDataTypes } from "../../types";
import { AvailabilityModel } from "../models/AvailabilityModel";

@Injectable()
export class AvailabilityService {
  // constructor(@Inject(PlannerModel) private planner: MongooseModel<PlannerModel>) {}
  @Inject(AvailabilityModel) private availability: MongooseModel<AvailabilityModel>;

  public async findAvailability() {
    return await this.availability.find();
  }

  public async findAvailabilityById(id: string) {
    return await this.availability.findById({ _id: id });
  }

  public async createAvailability({ startDate, endDate, adminId }: AvailabilityDataTypes) {
    return await this.availability.create({
      startDate,
      endDate,
      adminId
    });
  }
  public async deleteAvailability(id: string) {
    return await this.availability.deleteOne({ _id: id });
  }
}
