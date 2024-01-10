import { CategoryFieldType } from "./src/models/CategoryModel";

export interface AdminTypes {
  firebaseId: string;
  orgId: string;
  name: string;
  email: string;
}

export interface JWTPayload {
  email: string;
  id: string;
  role: string;
  ip?: string;
  device?: string;
}

export type VerificationType = "email" | "password" | "";

export interface NodeMailerTypes {
  email: string;
  code: string;
  title: string;
}

export enum VerificationEnum {
  EMAIL = "email",
  PASSWORD = "password"
}

export enum RoleEnum {
  MANAGER = "manager",
  SALESREP = "salesrep",
  ADMIN = "CRM System Administrator"
}

export type CategoryBodyTypes = {
  name: string;
  description?: string;
  saleRepId?: string;
};

export type RoleBodyTypes = {
  name: string;
};

export type LeadTypes = {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  categoryId: string;
  orgId?: string;
};

export type FieldTypes = {
  name: string;
  type: "string" | "number" | "boolean" | "date";
};

export enum SocialAction {
  email = "email",
  sms = "sms",
  instagram = "instagram",
  facebook = "facebook",
  youtube = "youtube"
}

export type PlannerDataTypes = {
  title: string;
  action: SocialAction;
  description?: string;
  timeOfExecution: string;
  startDate: string;
  orgId?: string;
  adminId?: string;
  categoryId?: string;
};

export type AvailabilityDataTypes = {
  startDate: number;
  endDate: number;
  adminId?: string;
};

export enum LeadStatusEnum {
  open = "open",
  claim = "claim",
  close = "close",
  pending = "pending",
  reject = "reject",
  recommend = "recommend",
  contact = "contact" // sales rep already contacted the lead
}

export type LeadsParamTypes = {
  status?: LeadStatusEnum;
  source?: string;
  leadId?: string;
  adminId?: string;
  categoryId?: string;
};

export type PaginationTypes = { source?: string; skip?: number; take?: number; search?: string; sort?: "asc" | "desc" };
