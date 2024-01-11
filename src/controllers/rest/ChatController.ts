import { Controller, Inject } from "@tsed/di";
import { BodyParams, Context, PathParams, QueryParams } from "@tsed/platform-params";
import { Enum, Get, Required, Returns } from "@tsed/schema";
import { ADMIN, SALESREP } from "../../util/constants";
import { Pagination, SuccessResult } from "../../util/entities";
import { AdminService } from "../../services/AdminService";
import { ADMIN_NOT_FOUND } from "../../util/errors";
import { Unauthorized } from "@tsed/exceptions";
import { ChatService } from "../../services/ChatService";
import { normalizeData } from "../../helper";
import { ChatResultModel } from "../../models/RestModels";
import { SocialAction } from "../../../types";

class ChatQueryParams {
  @Required() @Enum(SocialAction) public readonly source: SocialAction;
  @Required() public readonly leadId: string;
}

@Controller("/chat")
export class ChatController {
  @Inject()
  private adminService: AdminService;
  @Inject()
  private chatService: ChatService;

  @Get()
  @Returns(200, SuccessResult).Of(ChatResultModel)
  public async getChatByLeadId(@QueryParams() { source, leadId }: ChatQueryParams, @Context() context: Context) {
    const { adminId } = await this.adminService.checkPermissions({ hasRole: [ADMIN, SALESREP] }, context.get("user"));
    if (!adminId) throw new Unauthorized(ADMIN_NOT_FOUND);
    const chats = await this.chatService.findChatByLeadId({
      leadId,
      source
    });
    return new SuccessResult(new Pagination(normalizeData(chats), chats.length, ChatResultModel), Pagination);
  }
}
