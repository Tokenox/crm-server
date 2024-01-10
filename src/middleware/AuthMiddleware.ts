import { Context, Inject, Middleware, Req } from "@tsed/common";
import { AdminService } from "../services/AdminService";

/**
 * Authenticates users based on the Authorization header
 */
@Middleware()
export class AuthMiddleware {
  @Inject()
  public adminService: AdminService;

  public async use(@Req() req: Req, @Context() ctx: Context) {
    const isPublicRoute =
      ctx.request.url.startsWith("/docs") || ctx.request.url.startsWith("/rest/auth") || ctx.request.url.startsWith("/rest/webhook");
    const adminToken = req?.headers?.authorization || req.headers.cookie?.split("session=")[1];
    if (adminToken && !isPublicRoute) {
      const admin = await this.adminService.getActiveAdmin(adminToken);
      const _admin = { ...admin.toObject(), id: admin._id };
      ctx.set("user", _admin);
      return;
    }

    if (ctx.has("user") || isPublicRoute) {
      return;
    }
  }
}
