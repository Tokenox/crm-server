import { Inject, Injectable } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";
import { DynamicModel } from "../models/dynamicModelSchema";

@Injectable()
export class OrganizationService {
  constructor(@Inject(DynamicModel) private dynamicModel: MongooseModel<typeof DynamicModel>) {}

  public async createOrg() {
    const model = await this.dynamicModel.create({
      name: "rainmaker",
      description: "rainmaker desc",
      createdDate: new Date(),
      updatedDate: new Date()
    });
    return model;
  }
}
