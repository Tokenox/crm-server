// import { Default, Property } from "@tsed/schema";
// import { Model, ObjectID, Ref } from "@tsed/mongoose";
// import { OrgModel } from "./dynamicModelSchema";

// @Model()
// export class AdminModel {
//   @ObjectID("id")
//   _id: string;

//   @Property()
//   name: string;

//   @Property()
//   email: string;

//   @Property()
//   password: string;

//   @Property()
//   role: string;

//   // relation with org
//   @Property()
//   orgId: string;

//   @Ref(() => OrgModel)
//   org: Ref<OrgModel>;

//   @Property()
//   @Default(new Date())
//   createdAt: Date;

//   @Property()
//   @Default(new Date())
//   updatedAt: Date;
// }
