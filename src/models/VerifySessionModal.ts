import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { Default, Property } from "@tsed/schema";
import { AdminModel } from "./AdminModel";

@Model({ name: "verification-session" })
export class VerifySessionModal {
  @ObjectID("id")
  _id: string;

  @Property()
  token: string;

  @Property()
  @Default(false)
  logout: boolean;

  @Property()
  adminId: string;

  @Property()
  logoutAt: Date;

  @Property()
  loginAt: Date;

  @Property()
  @Default(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  expiry: Date;

  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;

  @Property()
  @Default(false)
  verified: boolean;

  @Ref(() => AdminModel)
  admin: Ref<AdminModel>;
}
