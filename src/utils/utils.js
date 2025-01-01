import crypto from "crypto";

// encrypt the data
export const encryptData = (data, secretKey) => {
  const cipher = crypto.createCipheriv(
    "aes-256-ecb",
    Buffer.from(secretKey, "utf-8"),
    null
  );

  let encryptedData = cipher.update(data, "utf-8", "hex");
  encryptedData += cipher.final("hex");

  return encryptedData;
};

// decrypt the data
export const decryptData = (encryptedData, secretKey) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-ecb",
    Buffer.from(secretKey, "utf-8"),
    null
  );

  let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
  decryptedData += decipher.final("utf-8");

  return decryptedData;
};
