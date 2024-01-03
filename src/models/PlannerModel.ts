import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { Default, Property, Required } from "@tsed/schema";
import { SocialAction } from "../../types";
import { AdminModel } from "./AdminModel";
import { OrganizationModel } from "./OrganizationModel";
import { CategoryModel } from "./CategoryModel";

@Model({ name: "planner" })
export class PlannerModel {
  @ObjectID("id")
  _id: string;

  @Required()
  title: string;

  @Property()
  action: SocialAction;

  @Property()
  description: string;

  @Property()
  categoryId: string;

  @Required()
  timeOfExecution: string;

  @Required()
  startDate: Date;

  @Property()
  orgId: string;

  @Property()
  adminId: string;

  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;

  @Ref(() => OrganizationModel)
  organization: Ref<OrganizationModel>;

  @Ref(() => AdminModel)
  admin: Ref<AdminModel>;

  @Ref(() => CategoryModel)
  category: Ref<CategoryModel>;
}
