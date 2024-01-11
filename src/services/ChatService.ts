import { Inject, Injectable } from "@tsed/di";
import { MongooseModel } from "@tsed/mongoose";
import { ChatModel } from "../models/ChatModel";
import { channel } from "diagnostics_channel";
import { SocialAction } from "../../types";

@Injectable()
export class ChatService {
  @Inject(ChatModel) private chat: MongooseModel<ChatModel>;

  //! Find
  public async findChatByLeadId({ leadId, source }: { leadId: string; source: SocialAction }) {
    return await this.chat.find({ leadId, source });
  }

  //! Create
  public async createChat({ source, message, leadIds }: { source: string; message: string; leadIds: string[] }) {
    // create bulk chat
    const chats = await this.chat.insertMany(
      leadIds.map((leadId) => ({
        source,
        message,
        leadId
      }))
    );
    return chats;
  }
}
