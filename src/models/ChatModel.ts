import { Default, Enum, Property } from "@tsed/schema";
import { Model, ObjectID, Ref } from "@tsed/mongoose";
import { LeadModel } from "./LeadModel";
import { SocialAction } from "../../types";

@Model({ name: "chat" })
export class ChatModel {
  @ObjectID("id")
  _id: string;

  @Enum(SocialAction)
  source: SocialAction;

  @Property()
  message: string;

  @Property()
  leadId: string;

  @Property()
  @Default(new Date())
  createdAt: Date;

  @Property()
  @Default(new Date())
  updatedAt: Date;

  @Ref(() => LeadModel)
  lead: Ref<LeadModel>;
}
