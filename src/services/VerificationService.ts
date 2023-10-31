import { Inject, Injectable } from "@tsed/di";
import { decrypt, encrypt } from "../util/crypto";
import { Forbidden } from "@tsed/exceptions";
import { EMAIL_NOT_VERIFIED, INCORRECT_CODE_OR_EMAIL, INVALID_VERIFICATION_TOKEN } from "../util/errors";
import { addMinutes, isPast } from "date-fns";
import { VerificationType } from "../../types";
import { generate6DigitCode } from "../util";
import { MongooseModel } from "@tsed/mongoose";
import { VerificationModel } from "../models/VerificationModel";

@Injectable()
export class VerificationService {
  constructor(@Inject(VerificationModel) private verification: MongooseModel<VerificationModel>) {}

  public async findVerificationByEmail(email: string) {
    return this.verification.findOne({ email, verified: false });
  }

  public async findVerificationById(id: string) {
    return this.verification.findById(id);
  }

  public isCodeExpired(expiry: Date) {
    return !expiry ? false : isPast(new Date(expiry));
  }

  public generateToken(id: string) {
    return encrypt(id);
  }

  public getDecryptedCode(code: string) {
    return decrypt(code);
  }

  public async expireToken(verificationId: string) {
    return await this.verification.findByIdAndUpdate({ _id: verificationId }, { expiry: new Date() });
  }

  public async addExpiryTime(verificationId: string) {
    return await this.verification.findByIdAndUpdate({ _id: verificationId }, { expiry: addMinutes(new Date(), 15) });
  }

  public async updateVerificationStatus({ id, status }: { id: string; status: boolean }) {
    return await this.verification.findByIdAndUpdate({ _id: id }, { verified: status });
  }

  public async verifyToken(data: { verificationToken: string; email?: string }) {
    const verification = await this.verification.findOne({ code: data.verificationToken, verified: false });
    if (!verification) throw new Forbidden(EMAIL_NOT_VERIFIED);
    if (data.email && data.email.toLowerCase() !== verification.email) throw new Forbidden(EMAIL_NOT_VERIFIED);
    return verification;
  }

  public async verifyCode({ email, code }: { email: string; code: string }) {
    const verification = await this.findVerificationByEmail(email);
    if (!verification || code !== verification.code) throw new Forbidden(INCORRECT_CODE_OR_EMAIL);
    await this.addExpiryTime(verification.id);
    return await this.updateVerificationStatus({ id: verification.id, status: true });
  }

  public async generateVerification({ email, type }: { email: string; type: VerificationType }) {
    let verification = await this.findVerificationByEmail(email);
    if (!verification) {
      verification = await this.verification.create({
        email: email.trim().toLowerCase(),
        type,
        code: generate6DigitCode()
      });
    }
    return verification;
  }

  public async verifyCodeByEmail({ email, code }: { email: string; code: string }) {
    const verification = await this.verification.findOne({ email, code, verified: false });
    if (!verification || code !== verification.code) throw new Forbidden(INCORRECT_CODE_OR_EMAIL);
    return verification;
  }
}
