import { CollectionOf, Default, Property } from "@tsed/schema";
import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { CategoryModel } from "./CategoryModel";
import { OrganizationModel } from "./OrganizationModel";

@Model({ name: "lead" })
export class LeadModel {
  @ObjectID("id")
  _id: string;

  @Property()
  firstName: string;

  @Property()
  lastName: string;

  @Property()
  email: string;

  @Property()
  phone: string;

  @Property()
  categoryId: string;

  @Property()
  orgId: string;

  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;

  // @Ref(() => CategoryModel)
  // category: Ref<CategoryModel>;

  @Ref(() => OrganizationModel)
  org: Ref<OrganizationModel>;
}
