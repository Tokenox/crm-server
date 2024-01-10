export const SESSION_EXPIRED = "SESSION_EXPIRED";
export const INVALID_TOKEN = "INVALID_TOKEN";
export const SOMETHING_WENT_WRONG = "SOMETHING_WENT_WRONG";
export const MISSING_PARAMS = "MISSING_PARAMS";
export const EMAIL_EXISTS = "EMAIL_EXISTS";
export const USERNAME_EXISTS = "USERNAME_EXISTS";
export const USERNAME_NOT_EXISTS = "USERNAME_NOT_EXISTS";
export const EMAIL_NOT_EXISTS = "EMAIL_NOT_EXISTS";
export const EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED";
export const INCORRECT_PASSWORD = "INCORRECT_PASSWORD";
export const SAME_OLD_AND_NEW_PASSWORD = "SAME_OLD_AND_NEW_PASSWORD";
export const INCORRECT_CODE = "INCORRECT_CODE";
export const USER_NOT_FOUND = "USER_NOT_FOUND";
export const INCORRECT_CODE_OR_EMAIL = "INCORRECT_CODE_OR_EMAIL";
export const NO_TOKEN_PROVIDED = "NO_TOKEN_PROVIDED";
export const INVALID_VERIFICATION_TOKEN = "INVALID_VERIFICATION_TOKEN";
export const ORG_NOT_FOUND = "ORG_NOT_FOUND";
export const ADMIN_NOT_FOUND = "ADMIN_NOT_FOUND";
export const VERIFICATION_NOT_FOUND = "VERIFICATION_NOT_FOUND";
export const ACCOUNT_RESTRICTED = "ACCOUNT_RESTRICTED";
export const SERVICE_NOT_AVAILABLE = "SERVICE_NOT_AVAILABLE";
export const TOKEN_NOT_FOUND = "TOKEN_NOT_FOUND";
export const ACCOUNT_NOT_EXISTS_ANYMORE = "ACCOUNT_NOT_EXISTS_ANYMORE";
export const SESSION_ALREADY_EXISTS = "SESSION_ALREADY_EXISTS";
export const ORGANIZATION_NAME_ALREADY_EXISTS = "ORGANIZATION_NAME_ALREADY_EXISTS";
export const ADMIN_ALREADY_EXISTS = "ADMIN_ALREADY_EXISTS";
export const CATEGORY_ALREADY_EXISTS = "CATEGORY_ALREADY_EXISTS";
export const CATEGORY_NOT_FOUND = "CATEGORY_NOT_FOUND";
export const INVALID_RESPONSE_QUICKBASE = "INVALID_RESPONSE_QUICKBASE";
export const ROLE_EXISTS = "ROLE_ALREADY_EXISTS";
export const FIELD_EXISTS = "FIELD_ALREADY_EXISTS";
export const EMPTY_CATEGORY = "EMPTY_CATEGORY";
export const EMPTY_LEAD = "EMPTY_LEAD";
export const SALE_REP_NOT_FOUND = "SALE_REP_NOT_FOUND";

export const errorMap: { [key: string]: string } = {
  SOMETHING_WENT_WRONG: "Looks like something is wrong, we are working to fix it.",
  NO_TOKEN_PROVIDED: "Access token is missing.",
  MISSING_PARAMS: "Missing required parameters.",
  EMAIL_EXISTS: "A user has already registered with this email.",
  EMAIL_NOT_VERIFIED: "Provided email isn't verfied by our system.",
  EMAIL_NOT_EXISTS: "This email does not exist in our system.",
  INCORRECT_PASSWORD: "Entered password is incorrect.",
  USER_NOT_FOUND: "No user found against provided parameters.",
  USERNAME_NOT_EXISTS: "Provided username doesn't exist in our records.",
  INCORRECT_CODE: "Provided code is not correct.",
  USERNAME_EXISTS: "A user has already registered with this username.",
  SESSION_EXPIRED: "Session expired, please login again.",
  INVALID_TOKEN: "Provided token is not valid",
  INCORRECT_CODE_OR_EMAIL: "Invalid code or verification not initialized",
  SAME_OLD_AND_NEW_PASSWORD: "Current pass and old password cannot be same, please set a different password",
  ERROR_LINKING_TWITTER: "You need to link your twitter account before you redeem!",
  INVALID_VERIFICATION_TOKEN: "Verification token is not valid.",
  ORG_NOT_FOUND: "Organization not found.",
  ADMIN_NOT_FOUND: "ADMIN_NOT_FOUND",
  VERIFICATION_NOT_FOUND: "verification application not found",
  ACCOUNT_RESTRICTED: "User account has been restricted. Please contact our support for further assistance.",
  SERVICE_NOT_AVAILABLE: "This service has been disabled temporarily. Please contact our support for further assistance.",
  TOKEN_NOT_FOUND: "Token not found.",
  ACCOUNT_NOT_EXISTS_ANYMORE: "This account doesn't exist anymore.",
  SESSION_ALREADY_EXISTS: "You have already logged in from another device.",
  ORGANIZATION_NAME_ALREADY_EXISTS: "Organization already exists with this name.",
  ADMIN_ALREADY_EXISTS: "Admin already exists with this email.",
  CATEGORY_ALREADY_EXISTS: "Category already exists with this name.",
  CATEGORY_NOT_FOUND: "Category not found.",
  FIELD_ALREADY_EXISTS: "Field already exists",
  EMPTY_CATEGORY: "Category can not be null",
  EMPTY_LEAD: "Lead name can not be null",
  INVALID_RESPONSE_QUICKBASE: "Invalid response from quickbase.",
  SALE_REP_NOT_FOUND: "Sale rep not found."
};
