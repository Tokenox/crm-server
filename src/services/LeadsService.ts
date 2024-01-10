import { Inject, Injectable } from "@tsed/di";
import { LeadModel } from "../models/LeadModel";
import { LeadStatusEnum, PaginationTypes } from "../../types";
import { MongooseModel } from "@tsed/mongoose";
import { CategoryModel } from "../models/CategoryModel";
import { SaleRepService } from "./SaleRepService";

type CreateLeadParams = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  categoryId: string;
  saleRepId: string;
  status: LeadStatusEnum;
};

@Injectable()
export class LeadService {
  constructor(
    @Inject(LeadModel) private lead: MongooseModel<LeadModel>,
    @Inject(CategoryModel) private category: MongooseModel<CategoryModel>
  ) {}
  @Inject() private saleRepService: SaleRepService;

  //! Find
  public async findLeads({ skip, take, search, sort = "desc" }: PaginationTypes) {
    const leads = await this.lead
      .find({
        firstName: { $regex: search, $options: "i" },
        lastName: { $regex: search, $options: "i" },
        email: { $regex: search, $options: "i" },
        phone: { $regex: search, $options: "i" }
      })
      .skip(skip || 0)
      .limit(take || 10)
      .sort({ createdAt: sort });
    return leads;
  }

  public async findLeadsBySource({
    saleRepId,
    status,
    source,
    skip,
    take,
    sort = "desc"
  }: { saleRepId: string; status: LeadStatusEnum } & PaginationTypes) {
    const leads = await this.lead
      .find({
        saleRepId,
        source: source?.toLocaleLowerCase(),
        status
      })
      .skip(skip || 0)
      .limit(take || 10)
      .sort({ createdAt: sort });
    const count = await this.lead.countDocuments({ saleRepId, source });
    return { leads, count };
  }

  public async findLead(id: string) {
    return this.lead.findById({ _id: id });
  }

  public async findLeadByEmail(email: string) {
    return this.lead.findOne({ email });
  }

  public async findLeadsByStatus(status: LeadStatusEnum) {
    return this.lead.find({ status });
  }

  public async findLeadByStatusAndRep({ status, saleRepId }: { status: LeadStatusEnum; saleRepId: string }) {
    return this.lead.find({
      status,
      saleRepId
    });
  }

  public async getLeadsCount() {
    return this.lead.countDocuments();
  }

  public async findLeadByTime({ status }: { status: LeadStatusEnum }) {
    const time = new Date(new Date().getTime() - 15 * 60000);
    return this.lead.find({
      status,
      updatedAt: { $lte: time }
    });
  }

  public async findLeadsByPlannerId({ plannerId }: { plannerId: string }) {
    return this.lead.find({ plannerIds: { $in: [plannerId] } }).limit(5);
  }

  //! Create
  public async createLead({ ...params }: CreateLeadParams) {
    return this.lead.create({
      ...params
    });
  }

  //! Update
  public async updateLead({ _id, firstName, lastName, email, phone, isNotify, status, saleRepId }: LeadModel) {
    return this.lead.findByIdAndUpdate(
      { _id },
      {
        firstName,
        lastName,
        email,
        phone,
        isNotify,
        status,
        saleRepId
      }
    );
  }

  public async updateLeadStatus({ id, status }: { id: string; status: LeadStatusEnum }) {
    return this.lead.findByIdAndUpdate(
      { _id: id },
      {
        status
      }
    );
  }

  public async updateLeadSaleRep({ id, saleRepId }: { id: string; saleRepId: string }) {
    return this.lead.findByIdAndUpdate(
      { _id: id },
      {
        saleRepId,
        updatedAt: new Date()
      }
    );
  }

  public async updateLeadStatusAndRep({ _id, status, saleRepId }: LeadModel) {
    return this.lead.findByIdAndUpdate(
      { _id },
      {
        status,
        saleRepId
      }
    );
  }

  public async updateLeadsTime(leadIds: string[]) {
    const time = new Date();
    return this.lead.updateMany(
      {
        _id: { $in: leadIds }
      },
      {
        updatedAt: new Date()
      }
    );
  }

  public async updateLeadPlannerIds({ source, plannerId }: { source: string; plannerId: string }) {
    const leads = await this.lead.find({ source });
    const leadIds = leads.map((lead) => lead._id);
    return this.lead.updateMany(
      {
        _id: { $in: leadIds }
      },
      {
        $push: { plannerIds: plannerId }
      }
    );
  }

  //! Delete
  public async deleteLead(id: string) {
    await this.lead.findByIdAndDelete({ _id: id });
    await this.saleRepService.deleteLeadId(id);
    return true;
  }

  public async deleteLeadsByCategoryId(categoryId: string) {
    return this.lead.deleteMany({ categoryId });
  }

  public async deletePlannerId({ id, plannerId }: { id: string; plannerId: string }) {
    return await this.lead.findByIdAndUpdate(
      { _id: id },
      {
        $pull: { plannerIds: plannerId }
      }
    );
  }

  public async deletePlannerByIds({ plannerId }: { plannerId: string }) {
    return await this.lead.updateMany(
      {
        plannerIds: { $in: [plannerId] }
      },
      {
        $pull: { plannerIds: plannerId }
      }
    );
  }
}
