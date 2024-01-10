import { BodyParams, Req, Res, Response } from "@tsed/common";
import { Controller, Inject } from "@tsed/di";
import { BadRequest, Forbidden, NotFound, Unauthorized } from "@tsed/exceptions";
import { Enum, Post, Property, Required, Returns, Put, Get } from "@tsed/schema";
import { ADMIN_NOT_FOUND, EMAIL_EXISTS, EMAIL_NOT_EXISTS, INCORRECT_PASSWORD, INVALID_TOKEN, MISSING_PARAMS } from "../../util/errors";
import {
  SuccessMessageModel,
  VerificationSuccessModel,
  IsVerificationTokenCompleteModel,
  AdminResultModel,
  AIResponseModel,
  CrmDealResultModel,
  CrmRateResultModel,
  SingleCrmDealResultModel,
  CrmPayrollResultModel,
  CrmTimelineResultModel,
  CrmTimelineAvgResultModel,
  SaleRefResultModel
} from "../../models/RestModels";
import { openAIService } from "../../helper/OpenAIService";
import { SuccessResult } from "../../util/entities";
import { VerificationService } from "../../services/VerificationService";
import { AdminService } from "../../services/AdminService";
import { NodemailerClient } from "../../clients/nodemailer";
import { ADMIN_ALREADY_EXISTS } from "../../util/errors";
import { OrganizationService } from "../../services/OrganizationService";
import { createPasswordHash } from "../../util";
import { VerificationEnum } from "../../../types";
import axios from "axios";
import { SaleRepService } from "../../services/SaleRepService";
import { normalizeData, normalizeObject } from "../../helper";

export class StartVerificationParams {
  @Required() public readonly email: string;
  @Required() @Enum(VerificationEnum) public readonly type: VerificationEnum | undefined;
}

class UpdateAdminPasswordParams {
  @Required() public readonly code: string;
  @Required() public readonly password: string;
}

class CompleteRegistration {
  @Required() public readonly name: string;
  @Required() public readonly email: string;
  @Required() public readonly password: string;
}

class ForgetAdminPasswordParams {
  @Required() public readonly email: string;
  @Required() public readonly password: string;
  @Required() public readonly code: string;
}

class AdminLoginBody {
  @Required() public readonly email: string;
  @Required() public readonly password: string;
}

class RegisterOrgParams {
  @Property() public readonly company: string;
  @Required() public readonly email: string;
  @Property() public readonly role: string;
  @Property() public readonly name: string;
  @Property() public readonly password: string;
  @Property() public readonly verificationToken: string;
}

class CrmDealsBody {
  @Required() public readonly recordId: string;
}

class CrmRateBody {}

export class SingleCrmDealResultCollection {
  @Property() public deals: SingleCrmDealResultModel[];
}

export class CrmRatesResultCollection {
  @Property() public rates: CrmRateResultModel[];
}

export class Avgtimeline {
  @Property() public timeline: CrmTimelineAvgResultModel;
}

export class AhjTimeline {
  @Property() public timeline: CrmTimelineResultModel[];
}

class AIResponseCollection {
  @Property() public responses: AIResponseModel[];
}
export class CrmDealResultCollection {
  @Property() public deals: CrmDealResultModel[];
}

class CrmPayBody {
  @Required() public readonly recordId: string;
}

class timelineBody {
  @Required() public readonly repId: string;
}
export class CrmPayrollResultCollection {
  @Property(CrmPayrollResultModel)
  public readonly payrollData: CrmPayrollResultModel[];
}

class CreateSaleRepBody {
  @Required() public readonly adminId: string;
  @Property() public readonly score: number;
}

const isSecure = process.env.NODE_ENV === "production";
@Controller("/auth")
export class AuthenticationController {
  @Inject()
  private verificationService: VerificationService;
  @Inject()
  private adminService: AdminService;
  @Inject()
  private organizationService: OrganizationService;
  @Inject()
  private saleRepService: SaleRepService;

  @Post("/start-verification")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async startVerification(@BodyParams() body: StartVerificationParams) {
    const { email, type } = body;
    if (!email || !type) throw new BadRequest(MISSING_PARAMS);
    const findAdmin = await this.adminService.findAdminByEmail(email);
    if (type === VerificationEnum.PASSWORD && !findAdmin) throw new BadRequest(EMAIL_NOT_EXISTS);
    const verificationData = await this.verificationService.generateVerification({ email, type });
    const response = await axios.post("https://voltaicqbapi.herokuapp.com/CRMAuth", {
      repEmail: email
    });
    if (!response || !response.data) throw new BadRequest("Invalid response from Quickbase API");
    if (response.data.recordID == "00000") throw new Unauthorized("Email is not authorized in Quickbase");
    if (!response.data.recordID) throw new NotFound("Invalid qbId received from the API.");
    await NodemailerClient.sendVerificationEmail({
      title: type || "Email",
      email,
      code: verificationData.code
    });
    return new SuccessResult({ success: true, message: "Verification Code sent successfully" }, SuccessMessageModel);
  }

  @Post("/verify")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async verifyCode(@BodyParams() body: { code: string; email: string }) {
    const { code, email } = body;
    if (!code || !email) throw new BadRequest(MISSING_PARAMS);
    await this.verificationService.verifyCodeByEmail({ code, email });
    return new SuccessResult({ success: true, message: "Verification Code verified successfully" }, SuccessMessageModel);
  }

  @Post("/register")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async newOrg(@BodyParams() body: RegisterOrgParams) {
    let { email, name, password } = body;
    let organization = await this.organizationService.findOrganization();
    if (!organization) {
      organization = await this.organizationService.createOrganization({ name: "Voltaic LLC", email });
    }
    const response = await axios.post("https://voltaicqbapi.herokuapp.com/CRMAuth", {
      repEmail: email
    });
    if (!response || !response.data) throw new BadRequest("Invalid response from Quickbase API");
    if (response.data.recordID == "00000") throw new Unauthorized("Email is not authorized in Quickbase");
    if (!response.data.recordID) throw new NotFound("Invalid qbId received from the API.");
    const admin = await this.adminService.findAdminByEmail(email);
    if (admin) throw new Error(ADMIN_ALREADY_EXISTS);
    await this.adminService.createAdmin({
      email: response.data.email,
      name: name || "",
      role: response.data.role,
      recordID: response.data.recordID,
      password: password,
      organizationId: organization?._id || ""
    });
    return new SuccessResult({ success: true, message: "Admin registered successfully" }, SuccessMessageModel);
  }

  @Post("/complete-registration")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async completeRegistration(@BodyParams() body: CompleteRegistration) {
    const { name, email, password } = body;
    if (!email || !password) throw new BadRequest(MISSING_PARAMS);
    const admin = await this.adminService.findAdminByEmail(email);
    if (!admin) throw new NotFound(ADMIN_NOT_FOUND);
    await this.adminService.completeAdminRegistration({ id: admin.id, name, email, password });
    return new SuccessResult({ success: true, message: "Admin registration successfully completed" }, SuccessMessageModel);
  }

  @Post("/login")
  @Returns(200, SuccessResult).Of(AdminResultModel)
  public async adminLogin(@BodyParams() body: AdminLoginBody, @Response() res: Response) {
    const { email, password } = body;
    if (!email || !password) throw new BadRequest(MISSING_PARAMS);
    const admin = await this.adminService.findAdminByEmail(email);
    if (!admin) throw new NotFound(EMAIL_NOT_EXISTS);
    if (admin.password !== createPasswordHash({ email, password })) throw new Forbidden(INCORRECT_PASSWORD);
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const options = { maxAge: expiresIn, httpOnly: true, secure: isSecure };
    const sessionCookie = await this.adminService.createSessionCookie(admin);
    // res.cookie("session", sessionCookie, options);
    return new SuccessResult(
      {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role || "",
        recordID: admin.recordID || "",
        twoFactorEnabled: admin.twoFactorEnabled,
        orgId: admin.orgId || "",
        company: "crm",
        token: sessionCookie,
        isSuperAdmin: admin.isSuperAdmin
      },
      AdminResultModel
    );
  }

  @Post("/create-sale-rep")
  @Returns(200, SuccessResult).Of(SaleRefResultModel)
  public async createSaleRep(@BodyParams() { adminId, score }: CreateSaleRepBody) {
    const saleRep = await this.saleRepService.createSaleRep({ adminId, score });
    return new SuccessResult(normalizeObject(saleRep), SaleRefResultModel);
  }

  @Get("/sale-rep")
  @Returns(200, SuccessResult).Of(SaleRefResultModel)
  public async getSaleRep() {
    const saleRep = await this.saleRepService.findAll();
    return new SuccessResult(normalizeData(saleRep), SaleRefResultModel);
  }

  //!--------------------------

  @Post("/crmPayroll")
  @Returns(200, SuccessResult).Of(CrmPayrollResultModel)
  public async crmPayroll(@BodyParams() body: CrmPayBody, @Response() res: Response) {
    console.log("crm payroll-----------------------------------------");
    const { recordId } = body;
    CrmPayBody;
    if (!recordId) throw new BadRequest(MISSING_PARAMS);

    const API_URL = "https://voltaicqbapi.herokuapp.com/CRMPayroll";

    const requestBody = {
      repID: recordId
    };

    const headers = {
      "Content-Type": "application/json"
    };

    console.log("Getting CRM Payroll...");
    console.log(recordId);

    const response = await axios.post(API_URL, requestBody, { headers });
    console.log("response--------", response);
    if (!response || !response.data) throw new BadRequest("Invalid response from Quickbase API");
    const data = response.data;
    const dataArray = Array.isArray(data) ? data : [data];

    // const payrollResults = dataArray.map((record) => ({
    //   lead: record["lead"] ? record["lead"].replace(/"/g, '') : null,
    //   userStatus: record["userStatus"] ? record["userStatus"].replace(/"/g, '') : null,
    //   salesRep: record["salesRep"] ? record["salesRep"].replace(/"/g, '') : null,
    //   ppwFinal: record["ppwFinal"] ?  record["ppwFinal"]  : null,
    //   status: record["systemSizeFinal"] ? record["systemSizeFinal"]  : null,
    //   milestone: record["milestone"] ? record["milestone"].replace(/"/g, '') : null,
    //   datePaid: record["datePaid"] ? record["datePaid"].replace(/"/g, '') : null,
    //   amount: record["amount"] ? record["amount"] : null,
    //   // Add other properties here as needed
    // }));

    const payrollResults = dataArray.map((record) => ({
      lead: record["lead"] ? record["lead"].replace(/"/g, "") : null,
      userStatus: record["userStatus"] ? record["userStatus"].replace(/"/g, "") : null,
      itemType: record["itemType"] ? record["itemType"].replace(/"/g, "") : null,
      saleDate: record["saleDate"] ? record["saleDate"].replace(/"/g, "") : null,
      relatedContractAmount: record["relatedContractAmount"] ? record["relatedContractAmount"].replace(/"/g, "") : null,
      relatedDealerFee: record["relatedDealerFee"] ? record["relatedDealerFee"].replace(/"/g, "") : null,
      addersFinal: record["addersFinal"] ? record["addersFinal"].replace(/"/g, "") : null,
      systemSizeFinal: record["systemSizeFinal"] ? record["systemSizeFinal"] : null,
      recordID: record["recordID"] ? record["recordID"].replace(/"/g, "") : null,
      relatedProject: record["relatedProject"] ? record["relatedProject"] : null,
      saleStatus: record["saleStatus"] ? record["saleStatus"].replace(/"/g, "") : null,
      clawbackNotes: record["clawbackNotes"] ? record["clawbackNotes"].replace(/"/g, "") : null,
      repRedline: record["repRedline"] ? record["repRedline"].replace(/"/g, "") : null,
      repRedlineOverrride: record["repRedlineOverrride"] ? record["repRedlineOverrride"].replace(/"/g, "") : null,
      leadgenRedlineOverrride: record["leadgenRedlineOverrride"] ? record["leadgenRedlineOverrride"].replace(/"/g, "") : null,
      salesRep: record["salesRep"] ? record["salesRep"].replace(/"/g, "") : null,
      ppwFinal: record["ppwFinal"] ? record["ppwFinal"] : null,
      status: record["status"] ? record["status"] : null,
      milestone: record["milestone"] ? record["milestone"].replace(/"/g, "") : null,
      datePaid: record["datePaid"] ? record["datePaid"].replace(/"/g, "") : null,
      amount: record["amount"] ? record["amount"] : null
    }));

    console.log("Returning CRM payroll data...");

    return new SuccessResult({ payrollData: payrollResults }, CrmPayrollResultCollection);
  }

  @Post("/crmPayrollLeadgen")
  @Returns(200, SuccessResult).Of(CrmPayrollResultModel)
  public async crmPayrollLeadgen(@BodyParams() body: CrmPayBody, @Response() res: Response) {
    const { recordId } = body;
    CrmPayBody;
    if (!recordId) throw new BadRequest(MISSING_PARAMS);

    const API_URL = "https://voltaicqbapi.herokuapp.com/CRMPayrollLeadGen";

    const requestBody = {
      repID: recordId
    };

    const headers = {
      "Content-Type": "application/json"
    };

    console.log("Getting CRM Payroll...");
    console.log(recordId);

    const response = await axios.post(API_URL, requestBody, { headers });
    if (!response || !response.data) throw new BadRequest("Invalid response from Quickbase API");
    const data = response.data;
    const dataArray = Array.isArray(data) ? data : [data];
    console.log(typeof data);

    // const payrollResults = dataArray.map((record) => ({
    //   lead: record["lead"] ? record["lead"].replace(/"/g, '') : null,
    //   userStatus: record["userStatus"] ? record["userStatus"].replace(/"/g, '') : null,
    //   salesRep: record["salesRep"] ? record["salesRep"].replace(/"/g, '') : null,
    //   ppwFinal: record["ppwFinal"] ?  record["ppwFinal"]  : null,
    //   status: record["systemSizeFinal"] ? record["systemSizeFinal"]  : null,
    //   milestone: record["milestone"] ? record["milestone"].replace(/"/g, '') : null,
    //   datePaid: record["datePaid"] ? record["datePaid"].replace(/"/g, '') : null,
    //   amount: record["amount"] ? record["amount"] : null,
    //   // Add other properties here as needed
    // }));

    const payrollResults = dataArray.map((record) => ({
      lead: record["lead"] ? record["lead"].replace(/"/g, "") : null,
      userStatus: record["userStatus"] ? record["userStatus"].replace(/"/g, "") : null,
      itemType: record["itemType"] ? record["itemType"].replace(/"/g, "") : null,
      saleDate: record["saleDate"] ? record["saleDate"].replace(/"/g, "") : null,
      relatedContractAmount: record["relatedContractAmount"] ? record["relatedContractAmount"].replace(/"/g, "") : null,
      relatedDealerFee: record["relatedDealerFee"] ? record["relatedDealerFee"].replace(/"/g, "") : null,
      addersFinal: record["addersFinal"] ? record["addersFinal"].replace(/"/g, "") : null,
      systemSizeFinal: record["systemSizeFinal"] ? record["systemSizeFinal"] : null,
      recordID: record["recordID"] ? record["recordID"].replace(/"/g, "") : null,
      saleStatus: record["saleStatus"] ? record["saleStatus"].replace(/"/g, "") : null,
      clawbackNotes: record["clawbackNotes"] ? record["clawbackNotes"].replace(/"/g, "") : null,
      repRedline: record["repRedline"] ? record["repRedline"].replace(/"/g, "") : null,
      repRedlineOverrride: record["repRedlineOverrride"] ? record["repRedlineOverrride"].replace(/"/g, "") : null,
      leadgenRedlineOverrride: record["leadgenRedlineOverrride"] ? record["leadgenRedlineOverrride"].replace(/"/g, "") : null,
      salesRep: record["salesRep"] ? record["salesRep"].replace(/"/g, "") : null,
      ppwFinal: record["ppwFinal"] ? record["ppwFinal"] : null,
      relatedProject: record["relatedProject"] ? record["relatedProject"] : null,
      status: record["status"] ? record["status"] : null,
      milestone: record["milestone"] ? record["milestone"].replace(/"/g, "") : null,
      datePaid: record["datePaid"] ? record["datePaid"].replace(/"/g, "") : null,
      amount: record["amount"] ? record["amount"] : null
    }));

    console.log("Returning CRM payroll data...");

    return new SuccessResult({ payrollData: payrollResults }, CrmPayrollResultCollection);
  }

  @Post("/crmDealsRookieLedgen")
  @Returns(200, SuccessResult).Of(CrmDealResultModel)
  public async crmDealsRookieLedgens(@Response() res: Response) {
    const API_URL = "https://voltaicqbapi.herokuapp.com/CRMDealsRookieLeadgen";

    const headers = {
      "Content-Type": "application/json"
    };

    console.log("Getting CRM users...");

    const response = await axios.post(API_URL, {}, { headers });
    if (!response || !response.data) throw new BadRequest("Invalid response from Quickbase API");

    const data = response.data;

    const dataArray = Array.isArray(data) ? data : [data];

    console.log(dataArray);

    // Map over dataArray and transform its structure
    const results = dataArray.map((project) => {
      return {
        email: project["email"] ? project["email"] : null,
        projectID: project["projectID"] || "",
        repName: project["repName"] || "sss",
        homeownerName: project["homeownerName"] || null,
        salesRep: project["salesRep"] || "crm",
        leadGen: project["leadGenerator"] || "crm",
        saleDate: project["saleDate"] || null,
        ppwFinal: project["ppwFinal"] || null,
        systemSizeFinal: project["systemSizeFinal"] || null,
        stage: project["stage"] || "",
        status: project["status"] || "",
        milestone: project["milestone"] || null,

        plansReceived: project["plansReceived"] || null,
        installComplete: project["installComplete"] || null,
        ptoApproved: project["ptoApproved"] || null,

        datePaid: project["datePaid"] || null,
        amount: project["amount"] || null
      };
    });

    return new SuccessResult({ deals: results }, CrmDealResultCollection);
  }

  @Post("/crmDealsRookie")
  @Returns(200, SuccessResult).Of(CrmDealResultModel)
  public async crmDealsRookie(@Response() res: Response) {
    const API_URL = "https://voltaicqbapi.herokuapp.com/CRMDealsRookie";

    const headers = {
      "Content-Type": "application/json"
    };

    console.log("Getting CRM users...");

    const response = await axios.post(API_URL, {}, { headers });
    if (!response || !response.data) throw new BadRequest("Invalid response from Quickbase API");

    const data = response.data;

    const dataArray = Array.isArray(data) ? data : [data];

    console.log(dataArray);

    // Map over dataArray and transform its structure
    const results = dataArray.map((project) => {
      return {
        email: project["email"] ? project["email"] : null,
        projectID: project["projectID"] || "",
        repName: project["repName"] || "sss",
        homeownerName: project["homeownerName"] || null,
        salesRep: project["salesRep"] || "crm",
        leadGen: project["leadGenerator"] || "crm",
        saleDate: project["saleDate"] || null,
        ppwFinal: project["ppwFinal"] || null,
        systemSizeFinal: project["systemSizeFinal"] || null,
        stage: project["stage"] || "",
        status: project["status"] || "",
        milestone: project["milestone"] || null,

        plansReceived: project["plansReceived"] || null,
        installComplete: project["installComplete"] || null,
        ptoApproved: project["ptoApproved"] || null,

        datePaid: project["datePaid"] || null,
        amount: project["amount"] || null
      };
    });

    return new SuccessResult({ deals: results }, CrmDealResultCollection);
  }

  @Post("/crmDealsLeadgen")
  @Returns(200, SuccessResult).Of(CrmDealResultModel)
  public async crmDealsLeadgen(@BodyParams() body: CrmDealsBody, @Response() res: Response) {
    const { recordId } = body;
    CrmPayBody;
    if (!recordId) throw new BadRequest(MISSING_PARAMS);

    const API_URL = "https://voltaicqbapi.herokuapp.com/CRMDealsLeadgen";

    const requestBody = {
      repID: recordId
    };

    const headers = {
      "Content-Type": "application/json"
    };

    console.log("Getting CRM users...");

    const response = await axios.post(API_URL, requestBody, { headers });
    if (!response || !response.data) throw new BadRequest("Invalid response from Quickbase API");

    const data = response.data;

    const dataArray = Array.isArray(data) ? data : [data];

    console.log(dataArray);

    // Map over dataArray and transform its structure
    const results = dataArray.map((project) => {
      return {
        email: project["email"] ? project["email"] : null,
        projectID: project["projectID"] || "",
        repName: project["repName"] || "sss",
        homeownerName: project["homeownerName"] || null,
        salesRep: project["salesRep"] || "crm",
        leadGen: project["leadGenerator"] || "crm",
        saleDate: project["saleDate"] || null,
        ppwFinal: project["ppwFinal"] || null,
        systemSizeFinal: project["systemSizeFinal"] || null,
        stage: project["stage"] || "",
        status: project["status"] || "",
        milestone: project["milestone"] || null,

        plansReceived: project["plansReceived"] || null,
        installComplete: project["installComplete"] || null,
        ptoApproved: project["ptoApproved"] || null,

        datePaid: project["datePaid"] || null,
        amount: project["amount"] || null
      };
    });

    return new SuccessResult({ deals: results }, CrmDealResultCollection);
  }

  // SINGLE CRM DEAL

  @Post("/crmDeal")
  @Returns(200, SuccessResult).Of(SingleCrmDealResultModel)
  public async crmDeal(@BodyParams() body: CrmDealsBody, @Response() res: Response) {
    const { recordId } = body;
    CrmPayBody;
    if (!recordId) throw new BadRequest(MISSING_PARAMS);

    const API_URL = "https://voltaicqbapi.herokuapp.com/CRMDeal";

    ///Deal ID changed here!
    const requestBody = {
      dealID: recordId
    };

    const headers = {
      "Content-Type": "application/json"
    };

    console.log("Getting CRM deal...");

    const response = await axios.post(API_URL, requestBody, { headers });
    if (!response || !response.data) throw new BadRequest("Invalid response from Quickbase API");

    const data = response.data;
    console.log(data);

    // Transform the structure as needed
    const result = {
      email: data["email"] ? data["email"] : null,
      projectID: data["projectID"] || "",
      repName: data["repName"] || "sss",
      homeownerName: data["homeownerName"] || null,
      salesRep: data["salesRep"] || "crm",
      leadGen: data["leadGenerator"] || "crm",
      saleDate: data["saleDate"] || null,
      ppwFinal: data["ppwFinal"] || null,
      systemSizeFinal: data["systemSizeFinal"] || null,
      stage: data["stage"] || "",
      status: data["status"] || "",
      milestone: data["milestone"] || null,
      plansReceived: data["plansReceived"] || null,
      installComplete: data["installComplete"] || null,
      ptoApproved: data["ptoApproved"] || null,
      datePaid: data["datePaid"] || null,
      amount: data["amount"] || null,
      address: data["address"] || "",
      vcmessages: data["vcmessages"] || [], // Assuming vcmessages field exists and is an array
      vcadders: data["vcAdders"] || [] // Assuming vcmadders field exists and is an array
    };

    //prod
    console.log("Result : ");

    console.log(result);

    const singleCrmDealResultModel = new SingleCrmDealResultModel(result); // Pass the result object as a single parameter

    return new SuccessResult(singleCrmDealResultModel, SingleCrmDealResultModel);
  }

  @Post("/askOpenAI")
  @Returns(200, SuccessResult).Of(AIResponseModel)
  public async askOpenAI(@BodyParams() body: any, @Response() res: Response) {
    try {
      // Extract the question from the request body
      const userQuestion = body.question;

      // Assuming openAIService.askQuestion is correctly implemented
      const aiResponseText = await openAIService.askQuestion(userQuestion);

      // Create an instance of AIResponseModel
      const responseModel = new AIResponseModel();
      responseModel.response = aiResponseText;

      // Return the response wrapped in a SuccessResult
      // Pass the instance and the class (constructor) for serialization
      return new SuccessResult(responseModel, AIResponseModel);
    } catch (error) {
      console.error(error);
      throw new BadRequest("Error processing your question");
    }
  }

  @Post("/crmRatesInActive")
  @Returns(200, SuccessResult).Of(CrmRateResultModel)
  public async crmRatesInActive(@Response() res: Response) {
    const API_URL = "https://voltaicqbapi.herokuapp.com/CRMRatesInActive";

    const headers = {
      "Content-Type": "application/json"
    };

    console.log("Getting CRM users...");

    const response = await axios.post(API_URL, {}, { headers });
    if (!response || !response.data) throw new BadRequest("Invalid response from Quickbase API");

    const data = response.data;

    const dataArray = Array.isArray(data) ? data : [data];

    console.log(dataArray);

    // Map over dataArray and transform its structure
    const results = dataArray.map((project) => {
      return {
        partner: project["fulfillmentPartner"] || null,
        years: project["years"] || null,
        status: project["status"] || null,
        financing: project["financing"] || null,
        apr: project["apr"] || null,
        feerate: project["feeRate"] || null
      };
    });

    return new SuccessResult({ rates: results }, CrmRatesResultCollection);
  }

  //CRM DEALS
  @Post("/crmDealsGlobal")
  @Returns(200, SuccessResult).Of(CrmDealResultModel)
  public async crmDealsGlobal(@BodyParams() body: CrmDealsBody, @Response() res: Response) {
    const { recordId } = body;
    CrmPayBody;
    if (!recordId) throw new BadRequest(MISSING_PARAMS);

    const API_URL = "https://voltaicqbapi.herokuapp.com/CRMDealsReport";

    const requestBody = {
      repID: recordId
    };

    const headers = {
      "Content-Type": "application/json"
    };

    console.log("Getting CRM users...");

    const response = await axios.post(API_URL, requestBody, { headers });
    if (!response || !response.data) throw new BadRequest("Invalid response from Quickbase API");

    const data = response.data;

    const dataArray = Array.isArray(data) ? data : [data];

    console.log(dataArray);

    // Map over dataArray and transform its structure
    const results = dataArray.map((project) => {
      return {
        email: project["email"] ? project["email"] : null,
        projectID: project["projectID"] || "",
        repName: project["repName"] || "sss",
        homeownerName: project["homeownerName"] || null,
        salesRep: project["salesRep"] || "crm",
        leadGen: project["leadGenerator"] || "crm",
        saleDate: project["saleDate"] || null,
        ppwFinal: project["ppwFinal"] || null,
        systemSizeFinal: project["systemSizeFinal"] || null,
        stage: project["stage"] || "",
        status: project["status"] || "",
        milestone: project["milestone"] || null,
        plansReceived: project["plansReceived"] || null,
        installComplete: project["installComplete"] || null,
        ptoApproved: project["ptoApproved"] || null,
        datePaid: project["datePaid"] || null,
        amount: project["amount"] || null,
        installer: project["installer"] || null,
        financing: project["financing"] || null
      };
    });

    return new SuccessResult({ deals: results }, CrmDealResultCollection);
  }

  //CRM DEALS
  @Post("/crmDeals")
  @Returns(200, SuccessResult).Of(CrmDealResultModel)
  public async crmDeals(@BodyParams() body: CrmDealsBody, @Response() res: Response) {
    const { recordId } = body;
    CrmPayBody;
    if (!recordId) throw new BadRequest(MISSING_PARAMS);

    const API_URL = "https://voltaicqbapi.herokuapp.com/CRMDeals";

    const requestBody = {
      repID: recordId
    };

    const headers = {
      "Content-Type": "application/json"
    };

    console.log("Getting CRM users...");

    const response = await axios.post(API_URL, requestBody, { headers });
    if (!response || !response.data) throw new BadRequest("Invalid response from Quickbase API");

    const data = response.data;

    const dataArray = Array.isArray(data) ? data : [data];

    console.log(dataArray);

    // Map over dataArray and transform its structure
    const results = dataArray.map((project) => {
      return {
        email: project["email"] ? project["email"] : null,
        projectID: project["projectID"] || "",
        repName: project["repName"] || "sss",
        homeownerName: project["homeownerName"] || null,
        salesRep: project["salesRep"] || "crm",
        leadGen: project["leadGenerator"] || "crm",
        saleDate: project["saleDate"] || null,
        ppwFinal: project["ppwFinal"] || null,
        systemSizeFinal: project["systemSizeFinal"] || null,
        stage: project["stage"] || "",
        status: project["status"] || "",
        milestone: project["milestone"] || null,
        plansReceived: project["plansReceived"] || null,
        installComplete: project["installComplete"] || null,
        ptoApproved: project["ptoApproved"] || null,
        datePaid: project["datePaid"] || null,
        amount: project["amount"] || null
      };
    });

    return new SuccessResult({ deals: results }, CrmDealResultCollection);
  }

  @Put("/reset-password")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async resetPassword(@BodyParams() body: UpdateAdminPasswordParams) {
    const { code, password } = body;
    if (!code || !password) throw new BadRequest(MISSING_PARAMS);
    const verification = await this.verificationService.verifyToken({ verificationToken: code });
    if (!verification) throw new BadRequest(INVALID_TOKEN);
    await this.adminService.updateAdminPassword({ email: verification.email, password });
    return new SuccessResult({ success: true, message: "Password updated successfully" }, SuccessMessageModel);
  }

  @Put("/complete-verification")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async completeVerification(@BodyParams() body: VerificationSuccessModel) {
    const { email, code } = body;
    if (!email || !code) throw new BadRequest(MISSING_PARAMS);
    await this.verificationService.verifyCode({ email, code });
    return new SuccessResult(
      {
        success: true,
        message: "verification completed successfully"
      },
      SuccessMessageModel
    );
  }

  @Post("/logout")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async adminLogout(@Req() req: Req, @Res() res: Res) {
    const sessionCookie = req.cookies.session || "";
    res.clearCookie("session");
    await this.adminService.deleteSessionCookie(sessionCookie);
    return new SuccessResult({ success: true, message: "logout successfully" }, SuccessMessageModel);
  }

  @Post("/crmRatesActive")
  @Returns(200, SuccessResult).Of(CrmRateResultModel)
  public async crmRatesActive(@Response() res: Response) {
    const API_URL = "https://voltaicqbapi.herokuapp.com/CRMRatesActive";

    const headers = {
      "Content-Type": "application/json"
    };

    console.log("Getting CRM users...");

    const response = await axios.post(API_URL, {}, { headers });
    if (!response || !response.data) throw new BadRequest("Invalid response from Quickbase API");

    const data = response.data;

    const dataArray = Array.isArray(data) ? data : [data];

    console.log(dataArray);

    // Map over dataArray and transform its structure
    const results = dataArray.map((project) => {
      return {
        partner: project["fulfillmentPartner"] || null,
        years: project["years"] || null,
        status: project["status"] || null,
        financing: project["financing"] || null,
        apr: project["apr"] || null,
        feerate: project["feeRate"] || null
      };
    });

    return new SuccessResult({ rates: results }, CrmRatesResultCollection);
  }

  //===================

  @Post("/crmAvgTimelines")
  @Returns(200, SuccessResult).Of(CrmTimelineResultModel)
  public async crmAvgTimelines(@BodyParams() body: timelineBody, @Response() res: Response) {
    const API_URL = "https://voltaicqbapi.herokuapp.com/CRMTimelines";

    const requestBody = {
      repID: body.repId
    };

    const headers = {
      "Content-Type": "application/json"
    };

    console.log("Getting CRM users...");

    const response = await axios.post(API_URL, requestBody, { headers });

    console.log(response);
    const data = response.data;

    const item = data; // Assuming data is the object you are working with

    // Check if data is not an array or empty
    // Log the original item for debugging
    console.log("Original Item:", item);

    // Check if item is not an object or is empty
    if (typeof item !== "object" || Object.keys(item).length === 0) {
      throw new Error("Expected data to be a non-empty object");
    }

    const results = {
      saleStage: item.saleStage,
      welcometage: item.welcometage,
      sstage: item.sstage,
      ntpstage: item.ntpstage,
      qcStage: item.qcStage,
      planStage: item.planStage,
      flatage: item.flatage,
      permitStage: item.permitStage,
      installStage: item.installStage,
      inspectStage: item.inspectStage,
      ptoStage: item.ptoStage
    };

    return new SuccessResult({ timeline: results }, Avgtimeline);
  }

  @Post("/crmAHJTimelines")
  @Returns(200, SuccessResult).Of(CrmTimelineResultModel)
  public async crmAHJTimelines(@BodyParams() body: timelineBody, @Response() res: Response) {
    const API_URL = "https://voltaicqbapi.herokuapp.com/CRMTimelinesByAHJ";

    const requestBody = {
      repID: body.repId
    };

    const headers = {
      "Content-Type": "application/json"
    };

    console.log("Getting CRM users...");

    const response = await axios.post(API_URL, requestBody, { headers });

    console.log(response);
    const data = response.data;

    if (!Array.isArray(data)) {
      throw new Error("Expected data to be an array");
    }
    // Instead of checking if the data is an array, just convert it to the Timeline format
    const results = data.map((item) => ({
      saleStage: item.averageSaleToWelcome ? item.averageSaleToWelcome.toString() : null,
      welcometage: item.averageWelcomeToSS ? item.averageWelcomeToSS.toString() : null,
      sstage: item.averageSsToNTP ? item.averageSsToNTP.toString() : null,
      ntpstage: item.averageNTPToQC ? item.averageNTPToQC.toString() : null,
      qcStage: item.averageQcToPlans ? item.averageQcToPlans.toString() : null,
      planStage: item.averagePlansToFLA ? item.averagePlansToFLA.toString() : null,
      flatage: item.averageFLAToPermit ? item.averageFLAToPermit.toString() : null,
      permitStage: item.averagePermitToInstallation ? item.averagePermitToInstallation.toString() : null,
      installStage: item.averageInstallationToInspection ? item.averageInstallationToInspection.toString() : null,
      inspectStage: item.averageFIToPTO ? item.averageFIToPTO.toString() : null,
      ptoStage: item.ptoStage ? item.ptoStage.toString() : null,
      AHJ: item.ahj ? item.ahj.toString() : null
    }));

    return new SuccessResult({ timeline: results }, AhjTimeline);
  }

  // @Post("/crmTimelines")
  // @Returns(200, SuccessResult).Of(CrmRateResultModel)
  // public async crmTimelines( @BodyParams() body: timelineBody,@Response() res: Response) {

  //   const API_URL = "https://voltaicqbapi.herokuapp.com/CRMTimelines";

  //   const requestBody = {
  //     repID: body.repId,
  //   };
  //   // const requestBody = {
  //   //   repId: args.repId,
  //   // };

  //   const headers = {
  //     "Content-Type": "application/json",
  //   };

  //   console.log("Getting CRM users...");

  //   const response = await axios.post(API_URL, requestBody, { headers });

  //   console.log(response)
  //   const data = response.data;
  //   console.log("Data");
  //   console.log(data);

  //   console.log(typeof data);

  //   // Instead of checking if the data is an array, just convert it to the Timeline format
  //   const timeline = {
  //     saleStage: data.saleStage ? data.saleStage.toString() : null,
  //     welcometage: data.welcometage ? data.welcometage.toString() : null,
  //     sstage: data.sstage ? data.sstage.toString() : null,
  //     ntpstage: data.ntpstage ? data.ntpstage.toString() : null,
  //     qcStage: data.qcStage ? data.qcStage.toString() : null,
  //     planStage: data.planStage ? data.planStage.toString() : null,
  //     flatage: data.flatage ? data.flatage.toString() : null,
  //     permitStage: data.permitStage ? data.permitStage.toString() : null,
  //     installStage: data.installStage ? data.installStage.toString() : null,
  //     inspectStage: data.inspectStage ? data.inspectStage.toString() : null,
  //     ptoStage: data.ptoStage ? data.ptoStage.toString() : null,
  //   };

  //   // Map over dataArray and transform its structure
  //   // const results = dataArray.map((project) => {
  //   //   return {
  //   //     partner: project["fulfillmentPartner"] || null,
  //   //     years: project["years"] || null,
  //   //     status: project["status"] ||null,
  //   //     financing: project["financing"] || null,
  //   //     apr: project["apr"] ||null,
  //   //     feerate: project["feeRate"] || null,

  //   //   };
  //   // });

  //   return new SuccessResult({ rates: results }, CrmRatesResultCollection);
  // }
}
