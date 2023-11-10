import { ArrayOf, Property, Required } from "@tsed/schema";
import { CategoryFieldType } from "./CategoryModel";

export class IdModel {
  @Required() public readonly id: string;
}

export class AdminModel {
  @Property() public readonly resetPass: boolean;
  @Property() public readonly role: string;
  @Property() public readonly company: string;
  @Property() public readonly email: string;
  @Property() public readonly twoFactorEnabled: boolean;
}
export class VerificationSuccessModel {
  @Required() public readonly email: string;
  @Required() public readonly code: string;
}
export class SuccessMessageModel {
  @Property() public readonly success: boolean;
  @Property() public readonly message: string;
}
export class IsVerificationTokenCompleteModel extends SuccessMessageModel {
  @Property() public readonly verificationToken: string;
}
export class AdminProfileResultModel {
  @Property() public readonly name: string;
  @Property() public readonly email: string;
  @Property() public readonly company: string;
  @Property() public readonly enabled: boolean;
  @Property() public readonly orgId: string;
  @Property() public readonly imageUrl: string;
  @Property() public readonly verifyStatus: string;
}
export class AdminResultModel {
  @Property() public readonly name: string;
  @Property() public readonly role: string;
  @Property() public readonly company: string;
  @Property() public readonly email: string;
  @Property() public readonly recordID: string;
  @Property() public readonly twoFactorEnabled: boolean;
  @Property() public readonly orgId: string;
  @Property() public token: string;
}

export class OrganizationResultModel {
  @Property() public readonly id: string;
  @Property() public readonly name: string;
  @Property() public readonly email: string;
  @Property() public readonly createdAt: Date;
  @Property() public readonly updatedAt: Date;
}

export class CategoryResultModel {
  @Property() public readonly id: string;
  @Property() public readonly name: string;
  @Property() public readonly description: string;
  @Property() public readonly adminId: string;
  @Property() public readonly orgId: string;
  @ArrayOf(Object) public readonly fields: CategoryFieldType[];
  @Property() public readonly createdAt: Date;
  @Property() public readonly updatedAt: Date;
}

export class LeadResultModel {
  @Property() public readonly _id: string;
  @Property() public readonly firstName: string;
  @Property() public readonly lastName: string;
  @Property() public readonly email: string;
  @Property() public readonly phone: string;
  @Property() public readonly categoryId: string;
  @Property() public readonly orgId: string;
  @Property() public readonly createdAt: Date;
  @Property() public readonly updatedAt: Date;
}

export class SingleCrmDealResultModel {
  @Property() public readonly email: string;
  @Property() public readonly projectID: string;
  @Property() public readonly plansReceived: string;
  @Property() public readonly installComplete: string;
  @Property() public readonly ptoApproved: string;
  @Property() public readonly homeownerName: string;
  @Property() public readonly repName: string;
  @Property() public readonly saleDate: string;
  @Property() public readonly leadGen: string;
  @Property() public readonly salesRep: string;
  @Property() public readonly ppwFinal: string;
  @Property() public readonly systemSizeFinal: string;
  @Property() public readonly stage: string;
  @Property() public readonly status: string;
  @Property() public readonly milestone: string;
  @Property() public readonly datePaid: string;
  @Property() public readonly amount: string;
  @Property() public readonly vcmessages: {
    relatedProject: string;
    type: string;
    from: string;
    text: string;
    createdAt: string;
  }[]; // Define vcmessages as an array of objects

  @Property() public readonly vcadders: {
    relatedProject: string;
    description: string;
    quantity: string;
    price: string;
    status: string;
    billTo: string;
  }[]; // Define vcmessages as an array of objects

  constructor(data: {
    email: string;
    projectID: string;
    plansReceived: string;
    installComplete: string;
    ptoApproved: string;
    homeownerName: string;
    repName: string;
    saleDate: string;
    leadGen: string;
    salesRep: string;
    ppwFinal: string;
    systemSizeFinal: string;
    stage: string;
    status: string;
    milestone: string;
    datePaid: string;
    amount: string;
    vcmessages: {
      relatedProject: string;
      type: string;
      from: string;
      text: string;
      createdAt: string;
    }[]; // Define vcmessages as an array of objects
    vcadders: {
      relatedProject: string;
      description: string;
      quantity: string;
      price: string;
      status: string;
      billTo: string;
    }[]; // Define vcmessages as an array of objects
  }) {
    this.email = data.email;
    this.projectID = data.projectID;
    this.plansReceived = data.plansReceived;
    this.installComplete = data.installComplete;
    this.ptoApproved = data.ptoApproved;
    this.homeownerName = data.homeownerName;
    this.repName = data.repName;
    this.saleDate = data.saleDate;
    this.leadGen = data.leadGen;
    this.salesRep = data.salesRep;
    this.ppwFinal = data.ppwFinal;
    this.systemSizeFinal = data.systemSizeFinal;
    this.stage = data.stage;
    this.status = data.status;
    this.milestone = data.milestone;
    this.datePaid = data.datePaid;
    this.amount = data.amount;
    this.vcmessages = data.vcmessages;
    this.vcadders = data.vcadders;
  }
}



export class CrmRateResultModel {
  @Property() public readonly partner: string;
  @Property() public readonly years: string;
  @Property() public readonly status: string;
  @Property() public readonly financing: string;
  @Property() public readonly apr: string;
  @Property() public readonly feerate: string;

}
export class AIResponseModel {
  @Property() public response: string; // removed the readonly modifier
}


export class CrmDealResultModel {
  @Property() public readonly email: string;
  @Property() public readonly projectID: string;
  @Property() public readonly plansReceived: string;
  @Property() public readonly installComplete: string;
  @Property() public readonly ptoApproved: string;
  @Property() public readonly homeownerName: string;
  @Property() public readonly repName: string;
  @Property() public readonly saleDate: string;
  @Property() public readonly leadGen: string;
  @Property() public readonly salesRep: string;
  @Property() public readonly ppwFinal: string;
  @Property() public readonly systemSizeFinal: string;
  @Property() public readonly stage: string;
  @Property() public readonly status: string;
  @Property() public readonly milestone: string;
  @Property() public readonly datePaid: string;
  @Property() public readonly amount: string;
}

export class CrmPayrollResultModel {
  @Property() public readonly lead: string;
  @Property() public readonly userStatus: string;
  @Property() public readonly itemType: string;
  @Property() public readonly saleDate: string;
  @Property() public readonly relatedContractAmount: string;
  @Property() public readonly relatedDealerFee: string;

  @Property() public readonly addersFinal: string;
  @Property() public readonly systemSizeFinal: string;
 
  @Property() public readonly recordID: string;
  @Property() public readonly saleStatus: string;

  

  @Property() public readonly clawbackNotes: string;


  @Property() public readonly repRedline: string;

  @Property() public readonly repRedlineOverrride: string;
  @Property() public readonly leadgenRedlineOverrride: string;

  @Property() public readonly salesRep: string;
  @Property() public readonly ppwFinal: string; // Change to match the type you need
  @Property() public readonly status: string; // Change to match the type you need
  @Property() public readonly milestone: string;
  @Property() public readonly datePaid: string;
  @Property() public readonly amount: string; // Change to match the type you need
}
