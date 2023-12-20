import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { Default, Property, Required } from "@tsed/schema";
import { SocialAction } from "../../types";
import { AdminModel } from "./AdminModel";
import { OrganizationModel } from "./OrganizationModel";

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

  @Required()
  timeOfExecution: Date;

  @Required()
  startDate: Date;

  @Required()
  endDate: Date;

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
}
