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
  
  export type CategoryBodyTypes = {
    name: string;
    description?: string;
    adminId?: string;
    orgId?: string;
  };
  
  export type LeadTypes = {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    categoryId: string;
    orgId?: string;
  };
  