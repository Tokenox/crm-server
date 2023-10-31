import { Controller, Inject } from "@tsed/di";
import { BadRequest } from "@tsed/exceptions";
import { BodyParams, Context } from "@tsed/platform-params";
import { Get, Returns } from "@tsed/schema";
import { ORG_NOT_FOUND } from "../../util/errors";
import { AdminResultModel } from "../../models/RestModels";
import { AdminService } from "../../services/AdminService";
import { SuccessArrayResult } from "../../util/entities";
import { ADMIN } from "../../util/constants";

@Controller("/admin")
export class AdminController {
  @Inject() private adminService: AdminService;

  @Get()
  @Returns(200, SuccessArrayResult).Of(AdminResultModel)
  public async getAllUsers(@BodyParams() body: { orgId: string }, @Context() context: Context) {
    const { orgId } = await this.adminService.checkPermissions({ hasRole: [ADMIN] }, context.get("user"));
    if (!orgId) throw new BadRequest(ORG_NOT_FOUND);
    const admins = await this.adminService.findAdminsByOrgId(orgId);
    const response = {
      admins: admins.map((admin) => {
        return {
          name: admin.name,
          email: admin.email,
          role: admin.role || "",
          twoFactorEnabled: admin.twoFactorEnabled,
          orgId: admin.orgId || "",
          company: "crm"
        };
      })
    };
    return new SuccessArrayResult(response.admins, AdminResultModel);
  }
}
