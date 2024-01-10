import { CollectionOf, Default, Property } from "@tsed/schema";
import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { SaleRepModel } from "./SaleRepModel";

export type CategoryFieldType = {
  name: string;
  type: string;
};

@Model({ name: "category" })
export class CategoryModel {
  @ObjectID("id")
  _id: string;

  @Property()
  name: string;

  @Property()
  description: string;

  @Property()
  saleRepId: string;

  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;

  @Ref(() => SaleRepModel)
  saleRep: Ref<SaleRepModel>;
}
