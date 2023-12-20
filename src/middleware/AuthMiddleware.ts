import { Context, Inject, Middleware, Req } from "@tsed/common";
import { OrganizationService } from "../services/OrganizationService";
import { AdminService } from "../services/AdminService";
import { Forbidden } from "@tsed/exceptions";
import { ORG_NOT_FOUND } from "../util/errors";

/**
 * Authenticates users based on the Authorization header
 */
@Middleware()
export class AuthMiddleware {
  @Inject()
  public adminService: AdminService;
  @Inject()
  public organizationService: OrganizationService;

  public async use(@Req() req: Req, @Context() ctx: Context) {
    console.log("cookie---------", req.headers);
    console.log("body---------", req);
    const isPublicRoute = ctx.request.url.startsWith("/docs") || ctx.request.url.startsWith("/rest");
    const adminToken = req.headers.cookie?.split("session=")[1];
    console.log("adminToken-------", adminToken);
    if (adminToken && !isPublicRoute) {
      const admin = await this.adminService.getActiveAdmin(adminToken);
      if (!admin.orgId) throw new Forbidden(ORG_NOT_FOUND);
      const org = await this.organizationService.findOrganizationById(admin.orgId);
      if (!org) throw new Forbidden(ORG_NOT_FOUND);
      const _admin = { ...admin.toObject(), company: org.name, id: admin._id };
      ctx.set("user", _admin);
      return;
    }

    if (ctx.has("user") || isPublicRoute) {
      return;
    }
  }
}
