import { model, Schema } from "mongoose";
import { categoryModel, plannerModel } from "./model";
import { NodemailerClient } from "../clients/nodemailer";

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
    timeOfExecution: { $lte: new Date().getTime().toString() }
    // startDate: { $eq: new Date() }
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
