import { CollectionOf, Default, Property, Required } from "@tsed/schema";
import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { OrganizationModel } from "./OrganizationModel";
import { VerifySessionModal } from "./VerifySessionModal";
import { SaleRepModel } from "./SaleRepModel";
import { ADMIN } from "../util/constants";

@Model({ name: "admin" })
export class AdminModel {
  @ObjectID("id")
  _id: string;

  @Required()
  name: string;

  @Required()
  email: string;

  @Required()
  password: string;

  @Property()
  recordID: string;

  @Required()
  @Default(ADMIN)
  role: string;

  @Property()
  @Default(false)
  isSuperAdmin: boolean;

  @Property()
  @Default(false)
  twoFactorEnabled: boolean;

  @Property()
  orgId: string;

  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;

  @Ref(() => OrganizationModel)
  organization: Ref<OrganizationModel>;

  @Ref(() => VerifySessionModal)
  @CollectionOf(() => VerifySessionModal)
  verifySessions: Ref<VerifySessionModal>[];

  @Ref(() => SaleRepModel)
  saleRep: Ref<SaleRepModel>;
}
