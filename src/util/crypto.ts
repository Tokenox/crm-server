import CryptoJS from "crypto-js";

const { ENCRYPTION_KEY } = process.env;

const secretKey = ENCRYPTION_KEY;
const IV = "16";

// Function to encrypt a message
export const encrypt = (dataToEncrypt: string): string => {
  if (!secretKey) throw new Error("ENCRYPTION_KEY not set");
  const cipherText = CryptoJS.AES.encrypt(dataToEncrypt, secretKey, {
    iv: CryptoJS.enc.Utf8.parse(IV),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return cipherText.toString();
};

// Function to decrypt an encrypted message
export const decrypt = (dataToDecrypt: string): string => {
  if (!secretKey) throw new Error("ENCRYPTION_KEY not set");
  const bytes = CryptoJS.AES.decrypt(dataToDecrypt, secretKey, {
    iv: CryptoJS.enc.Utf8.parse(IV),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return bytes.toString(CryptoJS.enc.Utf8);
};
