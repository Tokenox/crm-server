import { CollectionOf, Default, Property } from "@tsed/schema";
import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { AdminModel } from "./AdminModel";

@Model()
export class OrganizationModel {
  @ObjectID("id")
  _id: string;

  @Property()
  name: string;

  @Property()
  adminId: string;

  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;

  @Ref(() => AdminModel)
  @CollectionOf(() => AdminModel)
  admins: Ref<AdminModel>[];
}
