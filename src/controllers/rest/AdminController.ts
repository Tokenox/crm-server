import { Controller, Inject } from "@tsed/di";
import { BadRequest } from "@tsed/exceptions";
import { BodyParams, Context } from "@tsed/platform-params";
import { Enum, Get, Property, Put, Required, Returns } from "@tsed/schema";
import { ORG_NOT_FOUND } from "../../util/errors";
import { AdminResultModel, AdminRoleModel, IdModel } from "../../models/RestModels";
import { AdminService } from "../../services/AdminService";
import { SuccessArrayResult, SuccessResult } from "../../util/entities";
import { ADMIN } from "../../util/constants";
import { RoleEnum } from "../../../types";

class UpdateAdminParams {
  @Required() public readonly id: string;
  @Property() @Enum(RoleEnum) public readonly role: RoleEnum | undefined;
  @Property() public readonly name: string;
  @Property() public readonly isSuperAdmin: boolean;
}
@Controller("/admin")
export class AdminController {
  @Inject() private adminService: AdminService;

  @Get()
  @Returns(200, SuccessArrayResult).Of(AdminResultModel)
  public async getAllUsers(@BodyParams() body: { orgId: string }, @Context() context: Context) {
    await this.adminService.checkPermissions({ hasRole: [ADMIN] }, context.get("user"));
    const admins = await this.adminService.findAdmins();
    const response = {
      admins: admins.map((admin) => {
        return {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role || "",
          twoFactorEnabled: admin.twoFactorEnabled,
          orgId: admin.orgId || "",
          company: "Voltaic LLC",
          isSuperAdmin: admin.isSuperAdmin
        };
      })
    };
    return new SuccessArrayResult(response.admins, AdminResultModel);
  }

  @Put()
  @Returns(200, SuccessResult).Of(AdminResultModel)
  public async updateAdmin(@BodyParams() body: UpdateAdminParams, @Context() context: Context) {
    await this.adminService.checkPermissions({ hasRole: [ADMIN] }, context.get("user"));
    const admin = await this.adminService.updateAdmin({ ...body });
    return new SuccessResult(
      {
        id: admin?._id,
        email: admin?.email,
        role: admin?.role
      },
      AdminRoleModel
    );
  }
}
