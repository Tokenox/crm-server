import { BodyParams, Req, Res, Response } from "@tsed/common";
import { Controller, Inject } from "@tsed/di";
import { BadRequest, Forbidden, NotFound, Unauthorized } from "@tsed/exceptions";
import { Enum, Post, Property, Required, Returns, Put, Get } from "@tsed/schema";
import { ADMIN_NOT_FOUND, EMAIL_EXISTS, EMAIL_NOT_EXISTS, INCORRECT_PASSWORD, INVALID_TOKEN, MISSING_PARAMS } from "../../util/errors";
import { SuccessMessageModel, VerificationSuccessModel, IsVerificationTokenCompleteModel, AdminResultModel } from "../../models/RestModels";
import { SuccessResult } from "../../util/entities";
import { VerificationService } from "../../services/VerificationService";
import { AdminService } from "../../services/AdminService";
import { NodemailerClient } from "../../clients/nodemailer";
import { ADMIN_ALREADY_EXISTS, ORGANIZATION_NAME_ALREADY_EXISTS } from "../../util/errors";
import { OrganizationService } from "../../services/OrganizationService";
import { createPasswordHash } from "../../util";
import { VerificationEnum } from "../../../types";
import axios from "axios";

export class StartVerificationParams {
  @Required() public readonly email: string;
  @Required() @Enum(VerificationEnum) public readonly type: VerificationEnum | undefined;
}

class UpdateAdminPasswordParams {
  @Required() public readonly code: string;
  @Required() public readonly password: string;
}

class CompleteRegistration {
  @Required() public readonly name: string;
  @Required() public readonly email: string;
  @Required() public readonly password: string;
}

class ForgetAdminPasswordParams {
  @Required() public readonly email: string;
  @Required() public readonly password: string;
  @Required() public readonly code: string;
}

class AdminLoginBody {
  @Required() public readonly email: string;
  @Required() public readonly password: string;
}

class RegisterOrgParams {
  @Property() public readonly company: string;
  @Required() public readonly email: string;
  @Property() public readonly role: string;
  @Property() public readonly name: string;
  @Property() public readonly password: string;
  @Property() public readonly verificationToken: string;
}

const isSecure = process.env.NODE_ENV === "production";
@Controller("/auth")
export class AuthenticationController {
  @Inject()
  private verificationService: VerificationService;
  @Inject()
  private adminService: AdminService;
  @Inject()
  private organizationService: OrganizationService;

  @Post("/start-verification")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async startVerification(@BodyParams() body: StartVerificationParams) {
    const { email, type } = body;
    if (!email || !type) throw new BadRequest(MISSING_PARAMS);
    const findAdmin = await this.adminService.findAdminByEmail(email);
    if (type === VerificationEnum.PASSWORD && !findAdmin) throw new BadRequest(EMAIL_NOT_EXISTS);
    const verificationData = await this.verificationService.generateVerification({ email, type });
    const response = await axios.post("https://voltaicqbapi.herokuapp.com/CRMAuth", {
      repEmail: email
    });
    if (response.data.recordID == "00000") throw new Unauthorized("Email is not authorized in Quickbase");
    if (!response.data.recordID) throw new NotFound("Invalid qbId received from the API.");
    await NodemailerClient.sendVerificationEmail({
      title: type || "Email",
      email,
      code: verificationData.code
    });
    return new SuccessResult({ success: true, message: "Verification Code sent successfully" }, SuccessMessageModel);
  }

  @Post("/verify")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async verifyCode(@BodyParams() body: { code: string; email: string }) {
    const { code, email } = body;
    if (!code || !email) throw new BadRequest(MISSING_PARAMS);
    await this.verificationService.verifyCodeByEmail({ code, email });
    return new SuccessResult({ success: true, message: "Verification Code verified successfully" }, SuccessMessageModel);
  }

  @Post("/register")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async newOrg(@BodyParams() body: RegisterOrgParams) {
    let { email, name, password } = body;
    let organization = await this.organizationService.findOrganization();
    if (!organization) {
      organization = await this.organizationService.createOrganization({ name: "Voltaic LLC", email });
    }
    const response = await axios.post("https://voltaicqbapi.herokuapp.com/CRMAuth", {
      repEmail: email
    });
    if (response.data.recordID == "00000") throw new Unauthorized("Email is not authorized in Quickbase");
    if (!response.data.recordID) throw new NotFound("Invalid qbId received from the API.");
    const admin = await this.adminService.findAdminByEmail(email);
    if (admin) throw new Error(ADMIN_ALREADY_EXISTS);
    await this.adminService.createAdmin({
      email: response.data.email,
      name: name || "",
      role: response.data.role,
      recordID: response.data.recordID,
      password: password,
      organizationId: organization?._id || ""
    });
    return new SuccessResult({ success: true, message: "Admin registered successfully" }, SuccessMessageModel);
  }

  @Post("/complete-registration")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async completeRegistration(@BodyParams() body: CompleteRegistration) {
    const { name, email, password } = body;
    if (!email || !password) throw new BadRequest(MISSING_PARAMS);
    const admin = await this.adminService.findAdminByEmail(email);
    if (!admin) throw new NotFound(ADMIN_NOT_FOUND);
    await this.adminService.completeAdminRegistration({ id: admin.id, name, email, password });
    return new SuccessResult({ success: true, message: "Admin registration successfully completed" }, SuccessMessageModel);
  }

  @Post("/login")
  @Returns(200, SuccessResult).Of(AdminResultModel)
  public async adminLogin(@BodyParams() body: AdminLoginBody, @Response() res: Response) {
    const { email, password } = body;
    if (!email || !password) throw new BadRequest(MISSING_PARAMS);
    const admin = await this.adminService.findAdminByEmail(email);
    if (!admin) throw new NotFound(EMAIL_NOT_EXISTS);
    if (admin.password !== createPasswordHash({ email, password })) throw new Forbidden(INCORRECT_PASSWORD);
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const options = { maxAge: expiresIn, httpOnly: true, secure: isSecure };
    const sessionCookie = await this.adminService.createSessionCookie(admin);
    // res.cookie("session", sessionCookie, options);
    return new SuccessResult(
      {
        name: admin.name,
        email: admin.email,
        role: admin.role || "",
        recordID: admin.recordID || "",
        twoFactorEnabled: admin.twoFactorEnabled,
        orgId: admin.orgId || "",
        company: "crm",
        token: sessionCookie
      },
      AdminResultModel
    );
  }

  @Put("/reset-password")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async resetPassword(@BodyParams() body: UpdateAdminPasswordParams) {
    const { code, password } = body;
    if (!code || !password) throw new BadRequest(MISSING_PARAMS);
    const verification = await this.verificationService.verifyToken({ verificationToken: code });
    if (!verification) throw new BadRequest(INVALID_TOKEN);
    await this.adminService.updateAdminPassword({ email: verification.email, password });
    return new SuccessResult({ success: true, message: "Password updated successfully" }, SuccessMessageModel);
  }

  @Put("/complete-verification")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async completeVerification(@BodyParams() body: VerificationSuccessModel) {
    const { email, code } = body;
    if (!email || !code) throw new BadRequest(MISSING_PARAMS);
    await this.verificationService.verifyCode({ email, code });
    return new SuccessResult(
      {
        success: true,
        message: "verification completed successfully"
      },
      SuccessMessageModel
    );
  }

  @Post("/logout")
  @Returns(200, SuccessResult).Of(SuccessMessageModel)
  public async adminLogout(@Req() req: Req, @Res() res: Res) {
    const sessionCookie = req.cookies.session || "";
    res.clearCookie("session");
    await this.adminService.deleteSessionCookie(sessionCookie);
    return new SuccessResult({ success: true, message: "logout successfully" }, SuccessMessageModel);
  }
}
