import { Inject, Injectable } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";
import { SaleRepModel } from "../models/SaleRepModel";
import { AvailabilityService } from "./AvailabilityService";

@Injectable()
export class SaleRepService {
  @Inject(SaleRepModel) private saleRep: MongooseModel<SaleRepModel>;
  @Inject() private availabilityService: AvailabilityService;

  //! Find
  public async findAll() {
    return await this.saleRep.find();
  }

  public async findSaleRepById(id: string) {
    return await this.saleRep.findById({
      _id: id
    });
  }

  public async findSaleRep() {
    const saleRep = await this.saleRep.find().sort({ score: -1 }).limit(5);
    if (!saleRep.length) return false;
    for (let i = 0; i < saleRep.length; i++) {
      const rep = saleRep[i];
      const availability = await this.availabilityService.findAvailabilityByDateAndRep(rep._id);
      if (availability) {
        return rep;
      }
    }
  }

  public async findSaleRepByLeadId(leadId: string) {
    const saleRep = await this.saleRep
      .find({
        leadIds: {
          $nin: [leadId]
        }
      })
      .sort({ score: -1 })
      .limit(5);
    if (!saleRep.length) return false;
    for (let i = 0; i < saleRep.length; i++) {
      const rep = saleRep[i];
      const availability = await this.availabilityService.findAvailabilityByDateAndRep(rep._id);
      if (availability) {
        return rep;
      }
    }
  }

  public async findSaleRepByAdminId(adminId: string) {
    return await this.saleRep.findOne({ adminId });
  }

  //! Create
  public async createSaleRep({ adminId, score }: { adminId: string; score?: number }) {
    return this.saleRep.create({
      adminId,
      score: score || 10,
      leadIds: []
    });
  }

  //! Update
  public async updateSaleRepLeadIds({ id, leadId }: { id: string; leadId: string }) {
    // update saleRep leadIds array with new leadId
    const saleRep = await this.saleRep.findById({ _id: id });
    if (!saleRep) return false;
    saleRep.leadIds.push(leadId);
    await saleRep.save();
    return true;
  }

  //! Delete
  public async deleteLeadId(leadId: string) {
    const saleRep = await this.saleRep.find({
      leadIds: {
        $in: [leadId]
      }
    });
    if (!saleRep.length) return false;
    for (let i = 0; i < saleRep.length; i++) {
      const rep = saleRep[i];
      rep.leadIds = rep.leadIds.filter((id) => id !== leadId);
      await rep.save();
    }
    return true;
  }
}
