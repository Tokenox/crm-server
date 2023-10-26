import { Inject, Injectable } from "@tsed/di";
import { Forbidden } from "@tsed/exceptions";
import { OrganizationService } from "./OrganizationService";
import { ADMIN_NOT_FOUND, INVALID_TOKEN } from "../util/errors";
import { encrypt } from "../util/crypto";
import { createPasswordHash, createSessionToken } from "../util";
import { JWTPayload } from "../../types";

@Injectable()
export class AdminService {
  @Inject()
  private organizationService: OrganizationService;

  private createToken(id: string) {
    return encrypt(id);
  }

//   public async findAdminById(adminId: string) {
//     return await prisma.admin.findFirst({ where: { id: adminId } });
//   }

  /**
   * Asserts that the user has the given permissions
   *
   * @param opts permissions to check for
   * @param context the user from the request context
   * @returns the user's role, company and orgId
   */
  public async checkPermissions(opts: { hasRole?: string[]; restrictCompany?: string }, admin: JWTPayload) {
    const { role, company, email } = admin;
    if (company) {
      if (opts.hasRole && (!role || !opts.hasRole.includes(role))) throw new Forbidden("Forbidden");
      if (opts.restrictCompany && company !== opts.restrictCompany) throw new Forbidden("Forbidden");
      if (role === "manager" && !company) throw new Forbidden("Forbidden, company not specified");
      const org = await this.organizationService.findOrganizationByName(company);
      return { role, company, orgId: org?.id, email };
    }
    return {};
  }

//   public async findAdminByEmail(email: string) {
//     return await prisma.admin.findFirst({ where: { email } });
//   }

//   public async updateAdminAuth(adminId: string, twoFactorEnabled: boolean) {
//     return await prisma.admin.update({
//       where: { id: adminId },
//       data: { twoFactorEnabled }
//     });
//   }

//   public async updateAdmin(data: { id: string; name?: string; email?: string }) {
//     const { id, name, email } = data;
//     return await prisma.admin.update({
//       where: { id },
//       data: {
//         name: name && name,
//         email: email && email
//       }
//     });
//   }

//   public async createAdmin(params: { email: string; name: string; password: string; organizationId: string }) {
//     const { email, name, password, organizationId } = params;
//     return await prisma.admin.create({
//       data: {
//         email,
//         name,
//         orgId: organizationId,
//         password: createPasswordHash({ email, password })
//       }
//     });
//   }

//   public async verifySessionCookie(sessionCookie: string) {
//     return await prisma.verifyAdminSession.findFirst({ where: { sessionCode: sessionCookie } });
//   }

//   public async getActiveAdmin(token: string) {
//     const decodedToken = await this.verifySessionCookie(token);
//     if (!decodedToken || !decodedToken.adminId) throw new Forbidden(INVALID_TOKEN);
//     const admin = await this.findAdminById(decodedToken.adminId);
//     if (!admin) throw new Forbidden(ADMIN_NOT_FOUND);
//     return admin;
//   }

//   public async createSessionCookie(admin: Admin) {
//     const findSession = await prisma.verifyAdminSession.findFirst({ where: { adminId: admin.id } });
//     const token = createSessionToken({
//       id: admin.id,
//       email: admin.email,
//       role: admin.role || ""
//     });
//     if (!findSession) {
//       await prisma.verifyAdminSession.create({
//         data: { sessionCode: token, adminId: admin.id, lastLogin: new Date() }
//       });
//     } else {
//       await prisma.verifyAdminSession.update({
//         where: { id: findSession.id },
//         data: { sessionCode: token, lastLogin: new Date() }
//       });
//     }
//     return token;
//   }

//   public async deleteSessionCookie(adminId: string) {
//     return await prisma.verifyAdminSession.deleteMany({ where: { adminId, logout: true, logoutAt: new Date() } });
//   }

//   public async updateAdminPassword({ email, password }: { email: string; password: string }) {
//     const admin = await this.findAdminByEmail(email);
//     if (!admin) throw new Forbidden(ADMIN_NOT_FOUND);
//     return await prisma.admin.update({
//       where: { id: admin.id },
//       data: { password: createPasswordHash({ email, password }) }
//     });
//   }
}
