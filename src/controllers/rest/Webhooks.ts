import { Controller, Inject } from "@tsed/di";
import { LeadService } from "../../services/LeadsService";
import { Post, Property, Required, Returns, object } from "@tsed/schema";
import { SuccessResult } from "../../util/entities";
import { LeadResultModel, SuccessMessageModel } from "../../models/RestModels";
import { BodyParams } from "@tsed/platform-params";
import { SaleRepService } from "../../services/SaleRepService";
import { CategoryService } from "../../services/CategoryService";
import { LeadStatusEnum, SocialAction } from "../../../types";
import { normalizeObject } from "../../helper";
import { TwilioClient } from "../../clients/twilio";
import { PlannerService } from "../../services/PlannerService";
import { NodemailerClient } from "../../clients/nodemailer";

class CreateLeadParams {
  @Required() public source: string;
  @Required() public firstName: string;
  @Property() public lastName: string;
  @Required() public email: string;
  @Required() public phone: string;
  @Property() public message: string;
}

@Controller("/webhook")
export class Webhook {
  @Inject()
  private leadService: LeadService;
  @Inject()
  private saleRepService: SaleRepService;
  @Inject()
  private categoryService: CategoryService;
  @Inject()
  private plannerService: PlannerService;

  @Post("/lead")
  @Returns(200, SuccessResult).Of(LeadResultModel)
  public async createLeadWebhook(@BodyParams() body: CreateLeadParams) {
    const { source, firstName, lastName, email, phone, message } = body;
    const saleRep = await this.saleRepService.findSaleRep();
    if (!saleRep) return;
    let category = await this.categoryService.findCategoryByName(source.toLocaleLowerCase());
    if (!category) category = await this.categoryService.createCategory({ name: source, description: "" });
    const response = await this.leadService.createLead({
      firstName,
      lastName,
      email,
      phone,
      message,
      source: source.toLocaleLowerCase(),
      saleRepId: saleRep?._id,
      categoryId: category?._id,
      status: LeadStatusEnum.open
    });
    await this.saleRepService.updateSaleRepLeadIds({ id: saleRep._id, leadId: response._id });
    return new SuccessResult(normalizeObject(response), LeadResultModel);
  }

  @Post("/assign/lead")
  @Returns(200, SuccessResult).Of(LeadResultModel)
  public async assignLeadWebhook() {
    const leads = await this.leadService.findLeadByTime({ status: LeadStatusEnum.open });
    if (!leads.length) return;
    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      const saleRep = await this.saleRepService.findSaleRepByLeadId(lead._id);
      if (saleRep) {
        await this.leadService.updateLeadSaleRep({ id: lead._id, saleRepId: saleRep._id });
        await this.saleRepService.updateSaleRepLeadIds({ id: saleRep._id, leadId: lead._id });
      }
    }
    return new SuccessResult({ success: true, message: `${leads.length} open` }, SuccessMessageModel);
  }

  @Post("/send-emails")
  @Returns(200, SuccessResult).Of(Object)
  public async sendEmailWebhook() {
    const planners = await this.plannerService.findPlannerByTime({ socialAction: SocialAction.email });
    if (!planners.length) return;
    for (let i = 0; i < planners.length; i++) {
      const planner = planners[i];
      const leads = await this.leadService.findLeadsByPlannerId({
        plannerId: planner._id
      });
      if (!leads.length) continue;
      for (let j = 0; j < leads.length; j++) {
        const lead = leads[j];
        if (!lead.email) continue;
        try {
          await NodemailerClient.sendEmailToLead({
            email: lead.email,
            title: planner.title,
            description: planner.description
          });
          await this.leadService.deletePlannerId({ id: lead._id, plannerId: planner._id });
        } catch (error) {
          console.log("Nodemailer error---(", error);
        }
      }
    }
    return new SuccessResult({ success: true, message: `${planners.length} planners` }, SuccessMessageModel);
  }

  @Post("/send-sms")
  @Returns(200, SuccessResult).Of(Object)
  public async sendSMSWebhook() {
    const planners = await this.plannerService.findPlannerByTime({ socialAction: SocialAction.sms });
    console.log("planners---", planners);
    if (!planners.length) return;
    for (let i = 0; i < planners.length; i++) {
      const planner = planners[i];
      const leads = await this.leadService.findLeadsByPlannerId({
        plannerId: planner._id
      });
      if (!leads.length) continue;
      const phoneNumbers = leads.map((lead) => lead.phone);
      await TwilioClient.sendSmsToLead({ to: phoneNumbers, body: `${planner.title} - ${planner.description}` });
      await this.leadService.deletePlannerByIds({ plannerId: planner._id });
    }
    return new SuccessResult({ success: true, message: `${planners.length} planners` }, SuccessMessageModel);
  }
}
