import { Inject, Injectable } from "@tsed/di";
import { Forbidden } from "@tsed/exceptions";
import { ADMIN_NOT_FOUND, INVALID_TOKEN } from "../util/errors";
import { encrypt } from "../util/crypto";
import { createPasswordHash, createSessionToken } from "../util";
import { JWTPayload } from "../../types";
import { AdminModel } from "../models/AdminModel";
import { MongooseModel } from "@tsed/mongoose";
import { OrganizationModel } from "../models/OrganizationModel";
import { VerifySessionModal } from "../models/VerifySessionModal";
import { SaleRepService } from "./SaleRepService";

@Injectable()
export class AdminService {
  constructor(
    @Inject(OrganizationModel) private organizationService: MongooseModel<OrganizationModel>,
    @Inject(AdminModel) private admin: MongooseModel<AdminModel>,
    @Inject(VerifySessionModal) private verifySession: MongooseModel<VerifySessionModal>
  ) {}
  @Inject()
  private saleRep: SaleRepService;

  private createToken(id: string) {
    return encrypt(id);
  }

  public async findAdminById(adminId: string) {
    return await this.admin.findById({ _id: adminId });
  }

  /**
   * Asserts that the user has the given permissions
   *
   * @param opts permissions to check for
   * @param context the user from the request context
   * @returns the user's role, company and orgId
   */
  public async checkPermissions(opts: { hasRole?: string[] }, admin: JWTPayload) {
    const { role, email, id } = admin;
    if (opts.hasRole && (!role || !opts.hasRole.includes(role))) throw new Forbidden("Forbidden");
    return { role, email, adminId: id };
  }

  public async findAdminByEmail(email: string) {
    return await this.admin.findOne({ email: email.trim().toLowerCase() });
  }

  public async updateAdminAuth(adminId: string, twoFactorEnabled: boolean) {
    return await this.admin.findByIdAndUpdate({ _id: adminId }, { twoFactorEnabled });
  }

  public async updateAdmin(data: { id: string; name?: string; role?: string; isSuperAdmin: boolean }) {
    const { id, name, role, isSuperAdmin } = data;
    return await this.admin.findByIdAndUpdate({ _id: id }, { name, role, isSuperAdmin });
  }

  public async createAdmin(params: {
    email: string;
    name: string;
    password: string;
    organizationId: string;
    role: string;
    recordID: string;
  }) {
    const { email, name, password, organizationId, role, recordID } = params;
    const response = await this.admin.create({
      email: email.trim().toLowerCase(),
      name,
      role,
      recordID,
      orgId: organizationId,
      password: createPasswordHash({ email, password }),
      isSuperAdmin: email === process.env.SUPER_USER_EMAIL ? true : false
    });
    await this.saleRep.createSaleRep({ adminId: response._id });
    return response;
  }

  public async completeAdminRegistration({ id, name, email, password }: { id: string; name: string; email: string; password: string }) {
    return await this.admin.findByIdAndUpdate({ _id: id }, { name, email, password: createPasswordHash({ email, password }) });
  }

  public async verifySessionCookie(sessionCookie: string) {
    return await this.verifySession.findOne({ token: sessionCookie });
  }

  public async getActiveAdmin(token: string) {
    const decodedToken = await this.verifySessionCookie(token);
    if (!decodedToken || !decodedToken.adminId) throw new Forbidden(INVALID_TOKEN);
    const admin = await this.findAdminById(decodedToken.adminId);
    if (!admin) throw new Forbidden(ADMIN_NOT_FOUND);
    return admin;
  }

  public async createSessionCookie(admin: AdminModel) {
    const findSession = await this.verifySession.findOne({
      adminId: admin._id,
      logout: false,
      expiry: { $gt: new Date() },
      token: { $ne: "" }
    });
    let token = findSession?.token || "";
    if (!findSession) {
      token = createSessionToken({
        id: admin._id,
        email: admin.email,
        role: admin.role || ""
      });
      await this.verifySession.create({
        token,
        adminId: admin._id,
        lastLogin: new Date()
      });
    } else {
      await this.verifySession.updateOne({ adminId: admin._id }, { token, lastLogin: new Date() });
    }
    return token;
  }

  public async deleteSessionCookie(adminId: string) {
    await this.verifySession.updateOne({ adminId }, { logout: true });
    return true;
  }

  public async updateAdminPassword({ email, password }: { email: string; password: string }) {
    const admin = await this.findAdminByEmail(email);
    if (!admin) throw new Forbidden(ADMIN_NOT_FOUND);
    return await this.admin.findByIdAndUpdate({ _id: admin._id }, { password: createPasswordHash({ email, password }) });
  }

  public async findAdminsByOrgId(orgId: string) {
    return await this.admin.find({ orgId });
  }
  public async findAdmins() {
    return await this.admin.find();
  }
}
