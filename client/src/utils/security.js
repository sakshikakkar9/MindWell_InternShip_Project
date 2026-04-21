import CryptoJS from 'crypto-js';

// In a real app, this key would come from a secure user login
const SECRET_KEY = "mindwell_ultra_secure_key_123"; 

export const encryptData = (text) => {
  if (!text) return "";
  // AES Encryption returns a CipherObject which we convert to a string
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptData = (ciphertext) => {
  if (!ciphertext) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "Error: Could not decrypt data.";
  }
};