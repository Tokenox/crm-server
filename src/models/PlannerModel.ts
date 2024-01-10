import { Model, ObjectID } from "@tsed/mongoose";
import { Default, Enum, Property, Required } from "@tsed/schema";
import { SocialAction } from "../../types";

@Model({ name: "planner" })
export class PlannerModel {
  @ObjectID("id")
  _id: string;

  @Required()
  title: string;

  @Property()
  description: string;

  @Required()
  source: string;

  @Required()
  @Enum(SocialAction)
  action: SocialAction;

  @Required()
  timeOfExecution: number;

  @Required()
  startDate: number;

  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;
}
