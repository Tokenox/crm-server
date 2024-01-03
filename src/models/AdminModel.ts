import { CollectionOf, Default, Property } from "@tsed/schema";
import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { OrganizationModel } from "./OrganizationModel";
import { VerifySessionModal } from "./VerifySessionModal";
import { CategoryModel } from "./CategoryModel";
import { PlannerModel } from "./PlannerModel";
import { AvailabilityModel } from "./AvailabilityModel";

@Model({ name: "admin" })
export class AdminModel {
  @ObjectID("id")
  _id: string;

  @Property()
  name: string;

  @Property()
  email: string;

  @Property()
  password: string;

  @Property()
  recordID: string;

  @Property()
  @Default("admin")
  role: string;

  @Property()
  @Default(false)
  isSuperAdmin: boolean;

  @Property()
  @Default(false)
  twoFactorEnabled: boolean;

  @Property()
  orgId: string;
  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;

  @Ref(() => OrganizationModel)
  organization: Ref<OrganizationModel>;

  @Ref(() => VerifySessionModal)
  @CollectionOf(() => VerifySessionModal)
  verifySessions: Ref<VerifySessionModal>[];

  @Ref(() => CategoryModel)
  @CollectionOf(() => CategoryModel)
  categories: Ref<CategoryModel>[];

  @Ref(() => PlannerModel)
  @CollectionOf(() => PlannerModel)
  planners: Ref<PlannerModel>[];

  @Ref(() => AvailabilityModel)
  @CollectionOf(() => AvailabilityModel)
  availability: Ref<AvailabilityModel>[];
}
