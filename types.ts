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
  company?: string;
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
  adminId?: string;
  orgId?: string;
  fields: CategoryFieldType[];
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
  startDate: string;
  endDate: string;
  adminId?: string;
};