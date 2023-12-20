import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { Default, Property, Required } from "@tsed/schema";

@Model({ name: "role" })
export class RoleModel {
  @ObjectID("id")
  _id: string;

  @Required()
  name: string;

  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;
}
