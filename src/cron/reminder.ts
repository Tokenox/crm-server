import { model, Schema } from "mongoose";
import { categoryModel, leadsModel, plannerModel } from "./model";
import { NodemailerClient } from "../clients/nodemailer";
import { LeadStatusEnum } from "types";

export const runJob = async () => {
  const planners = await plannerModel.find();
  return planners;
};

export const notifyLeads = async () => {
  const _planners = await plannerModel.find();
  // console.log("_planners-------------**", _planners);
  // filter planners by timeOfExecution and startDate
  const filteredPlanners = _planners.filter((planner) => {
    const timeOfExecution = Number(planner.timeOfExecution);
    const startDate = new Date(planner.startDate);
    const _startDate = `${(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())}`;
    const currentDate = new Date();
    const _currentDate = `${(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())}`;
    return timeOfExecution <= currentDate.getTime() && _startDate == _currentDate;
  });

  console.log("filteredPlanners-------------**", filteredPlanners);

  const planners = await plannerModel.find({
    timeOfExecution: {
      $lte: new Date().getTime().toString(),
      // startDate is today
      startDate: { $eq: new Date().toISOString().split("T")[0] }
    }
  });
  console.log("planners-------------", planners);
  const categories = await categoryModel.find({
    _id: { $in: planners.map((planner) => planner.categoryId) }
  });
  console.log("categories-------------", categories);
  filteredPlanners.forEach(async (planner) => {
    // const category = categories.find((category) => category._id === planner.categoryId);
    const category = await categoryModel.findById(planner.categoryId);
    console.log("category-------------", category);
    if (!category) return;
    let dynamicModel: any;
    try {
      dynamicModel = model(category.name);
    } catch (error) {
      const ProductSchema = new Schema({}, { strict: false });
      dynamicModel = model(category.name, ProductSchema);
    }
    const leads = await dynamicModel.find();
    console.log("leads-------------", leads);
    leads.forEach(async (lead: any) => {
      try {
        await NodemailerClient.sendEmailToPlanner({
          title: planner.title,
          description: planner.description,
          action: planner.action,
          email: lead.email || ""
        });
        await dynamicModel.updateOne({ _id: lead._id }, { isNotify: false });
      } catch (error) {
        console.log("error", error);
      }
    });
  });
  return "success";
};

export const claimNextLead = async () => {
  const leads = await leadsModel.find({
    status: LeadStatusEnum.open
  });
  console.log("leads--------------------------------------**", leads);
  if (!leads.length) return;

  // const updateLeads = async (leads:any) => {
  //   let updatedLeads: any = [];
  //   for (let i = 0; i < leads.length; i++) {
  //     const lead = leads[i];
  //     // console.log("lead---------", lead)
  //     const saleRep = await this.saleRepService.findSaleRepByLeadId(lead._id);
  //     if (!saleRep) return;
  //     console.log("saleRep---------", saleRep);
  //     // if (!saleRep) {
  //     //   await this.leadsService.updateLeadStatus({ leadId: lead._id, status: LeadStatusEnum.open, adminId: "" });
  //     //   return updatedLeads.push([]);
  //     // }
  //     const updateLead = await this.leadsService.updateLead({ leadId: lead._id, adminId: saleRep.adminId });

  //     console.log("updateLead--------------------------------------", updateLead);
  //     let dynamicModel;
  //     try {
  //       dynamicModel = model(lead.source.toLocaleLowerCase());
  //     } catch (error) {
  //       const schema = new Schema({}, { strict: false });
  //       dynamicModel = model(lead.source.toLocaleLowerCase(), schema);
  //     }
  //     const response = await dynamicModel.updateOne(
  //       { _id: lead.leadId },
  //       { $set: { status: LeadStatusEnum.claim, adminId: saleRep.adminId, updatedAt: new Date() } }
  //     );
  //     await this.saleRepService.updateSaleRep({
  //       id: saleRep._id,
  //       leadId: lead._id
  //     });
  //     console.log("response--------------------------------------", response);
  //     updatedLeads = [...updatedLeads, updateLead];
  //   }
  //   return updatedLeads;
  // };
  // const updatedLeads = await updateLeads(leads);
  // return updatedLeads;
};
