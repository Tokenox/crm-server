import { CollectionOf, Default, Property } from "@tsed/schema";
import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { AdminModel } from "./AdminModel";
import { LeadModel } from "./LeadModel";
import { OrganizationModel } from "./OrganizationModel";

@Model({ name: "category" })
export class CategoryModel {
  @ObjectID("id")
  _id: string;

  @Property()
  name: string;

  @Property()
  description: string;

  @Property()
  adminId: string;

  @Property()
  orgId: string;

  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;

  @Ref(() => AdminModel)
  admin: Ref<AdminModel>;

  @Ref(() => OrganizationModel)
  org: Ref<OrganizationModel>;

  @Ref(() => LeadModel)
  @CollectionOf(() => LeadModel)
  leads: Ref<LeadModel>[];
}
