import { Inject, Injectable } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";
import { OrganizationModel } from "../models/OrganizationModel";

@Injectable()
export class OrganizationService {
  constructor(@Inject(OrganizationModel) private orgModel: MongooseModel<OrganizationModel>) {}

  public async createOrganization({ name }: { name: string }) {
    const model = await this.orgModel.create({
      name
    });
    return model;
  }

  public async findOrganizations() {
    return await this.orgModel.find();
  }

  public async findOrganizationByName(name: string) {
    return await this.orgModel.findOne({ name });
  }

  public async findOrganizationById(id: string) {
    return await this.orgModel.findById({ _id: id });
  }
}
