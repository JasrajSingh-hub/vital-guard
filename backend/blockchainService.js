import crypto from "crypto";
import { ethers } from "ethers";
import "dotenv/config";

const CONTRACT_ABI = [
  "function storeRecordHash(string patientId, bytes32 recordHash) external",
  "function grantConsent(string patientId) external",
  "function verifyRecordHash(string patientId, bytes32 recordHash) external view returns (bool)"
];

function getConfig() {
  const rpcUrl = process.env.CHAIN_RPC_URL || process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545";
  const privateKey = process.env.PRIVATE_KEY || "";
  const contractAddress = process.env.CONTRACT_ADDRESS || "";

  if (!rpcUrl) throw new Error("Missing CHAIN_RPC_URL or SEPOLIA_RPC_URL in .env");
  if (!privateKey) throw new Error("Missing PRIVATE_KEY in .env");
  if (!contractAddress) throw new Error("Missing CONTRACT_ADDRESS in .env");

  return { rpcUrl, privateKey, contractAddress };
}

function getContract() {
  const { rpcUrl, privateKey, contractAddress } = getConfig();
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);
}

export function sha256Hex(encryptedRecord) {
  return crypto.createHash("sha256").update(encryptedRecord).digest("hex");
}

export function sha256Bytes32(encryptedRecord) {
  return `0x${sha256Hex(encryptedRecord)}`;
}

export async function storeEncryptedRecordHash(patientId, encryptedRecord) {
  if (!patientId) throw new Error("patientId is required");
  if (!encryptedRecord) throw new Error("encryptedRecord is required");

  const contract = getContract();
  const hashBytes32 = sha256Bytes32(encryptedRecord);
  const tx = await contract.storeRecordHash(patientId, hashBytes32);
  const receipt = await tx.wait();

  return {
    patientId,
    recordHash: hashBytes32,
    transactionHash: receipt.hash
  };
}

export async function grantPatientConsent(patientId) {
  if (!patientId) throw new Error("patientId is required");

  const contract = getContract();
  const tx = await contract.grantConsent(patientId);
  const receipt = await tx.wait();

  return {
    patientId,
    transactionHash: receipt.hash
  };
}

export async function verifyEncryptedRecordHash(patientId, encryptedRecord) {
  if (!patientId) throw new Error("patientId is required");
  if (!encryptedRecord) throw new Error("encryptedRecord is required");

  const contract = getContract();
  const hashBytes32 = sha256Bytes32(encryptedRecord);
  const exists = await contract.verifyRecordHash(patientId, hashBytes32);

  return {
    patientId,
    recordHash: hashBytes32,
    exists
  };
}
