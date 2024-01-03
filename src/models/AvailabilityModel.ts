import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { CollectionOf, Default, Property, Required } from "@tsed/schema";
import { AdminModel } from "./AdminModel";
import { LeadModel } from "./LeadModel";

@Model({ name: "availability" })
export class AvailabilityModel {
  @ObjectID("id")
  _id: string;

  @Required()
  startDate: Date;

  @Required()
  endDate: Date;

  @Property()
  adminId: string;

  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;

  @Ref(() => AdminModel)
  admin: Ref<AdminModel>;

}
