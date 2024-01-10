import { Default, Property, Enum, CollectionOf } from "@tsed/schema";
import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { CategoryModel } from "./CategoryModel";
import { LeadStatusEnum, SocialAction } from "../../types";
import { SaleRepModel } from "./SaleRepModel";

@Model({ name: "leads" })
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
  message: string;

  @Property()
  source: string;

  @Property()
  @Default(false)
  isNotify: boolean;

  @Enum(LeadStatusEnum)
  status: LeadStatusEnum;

  @Property()
  categoryId: string;

  @Property()
  saleRepId: string;

  @CollectionOf(String)
  @Default([])
  plannerIds: string[];

  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;

  @Ref(() => CategoryModel)
  category: Ref<CategoryModel>;

  @Ref(() => SaleRepModel)
  saleRep: Ref<SaleRepModel>;
}
