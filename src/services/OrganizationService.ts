import { Inject, Injectable } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";
import { OrganizationModel } from "../models/OrganizationModel";

@Injectable()
export class OrganizationService {
  constructor(@Inject(OrganizationModel) private orgModel: MongooseModel<typeof OrganizationModel>) {}

  public async createOrg() {
    const model = await this.orgModel.create({
      name: "rainmaker",
      description: "rainmaker desc",
      createdDate: new Date(),
      updatedDate: new Date()
    });
    return model;
  }
}
