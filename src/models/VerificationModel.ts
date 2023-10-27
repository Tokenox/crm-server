import { Model, ObjectID } from "@tsed/mongoose";
import { Default, Enum, Property } from "@tsed/schema";

enum TypeEnum {
  EMAIL = "email",
  PASSWORD = "password"
}

@Model({ name: "verification" })
export class VerificationModel {
  @ObjectID("id")
  _id: string;

  @Property()
  email: string;

  @Property()
  @Default(false)
  verified: boolean;

  @Property()
  code: string;

  @Property()
  expiry: Date;

  @Enum(TypeEnum)
  type: TypeEnum;

  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;
}
