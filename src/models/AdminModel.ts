import { CollectionOf, Default, Property } from "@tsed/schema";
import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { OrganizationModel } from "./OrganizationModel";
import { VerifySessionModal } from "./VerifySessionModal";

@Model()
export class AdminModel {
  @ObjectID("id")
  _id: string;

  @Property()
  name: string;

  @Property()
  email: string;

  @Property()
  password: string;

  @Property()
  role: string;

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
}
