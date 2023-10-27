import { Inject, Injectable } from "@tsed/di";
import { LeadModel } from "../models/LeadModel";
import { LeadTypes } from "types";
import { MongooseModel } from "@tsed/mongoose";
import { CategoryService } from "./CategoryService";

@Injectable()
export class LeadService {
  constructor(@Inject(LeadModel) private lead: MongooseModel<LeadModel>) {}
  // private categoryService: CategoryService

  public async findLeadsByOrgId(orgId: string) {
    return this.lead.find({ orgId });
  }

  public async findLeadById(id: string) {
    return this.lead.findById({ _id: id });
  }

  public async createLead({ firstName, lastName, email, phone, categoryId, orgId }: LeadTypes) {
    return this.lead.create({ firstName, lastName, email, phone, categoryId, orgId });
  }

  public async createBulkLeads({ body, orgId }: { body: LeadTypes[]; orgId: string }) {
    // let findCategory = await this.categoryService.findCategory();
    // if (!findCategory) {
    //   findCategory = await this.categoryService.createCategory({
    //     name: "All",
    //     description: "All categories",
    //     orgId
    //   });
    // }
    // const leads = body.map((lead) => {
    //   return {
    //     firstName: lead.firstName,
    //     lastName: lead.lastName,
    //     email: lead.email,
    //     phone: lead.phone,
    //     categoryId: findCategory?.id,
    //     orgId
    //   };
    // });
    // // create many leads with mongoose
    // const response = await this.lead.create(leads);
    // return response;
  }

  public async updateLead({ id, firstName, lastName, email, phone }: LeadTypes & { id: string }) {
    return this.lead.findByIdAndUpdate({ _id: id }, { firstName, lastName, email, phone });
  }

  public async deleteLead(id: string) {
    return this.lead.findByIdAndDelete({ _id: id });
  }

  public async deleteLeadsByCategoryId(categoryId: string) {
    return this.lead.deleteMany({ categoryId });
  }
}
