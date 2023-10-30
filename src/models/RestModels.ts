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
