                                                                                                                            import crypto from "crypto";
import { ethers } from "ethers";
import "dotenv/config";

const CONTRACT_ABI = [
  "event RecordStored(string indexed patientId, bytes32 indexed recordHash, address indexed storedBy, uint256 timestamp)",
  "event ConsentGranted(string indexed patientId, address indexed grantedBy, uint256 timestamp)",
  "function storeRecordHash(string patientId, bytes32 recordHash) external",
  "function grantConsent(string patientId) external",
  "function verifyRecordHash(string patientId, bytes32 recordHash) external view returns (bool)"
];

let cachedContract = null;
let listenersAttached = false;

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
  if (cachedContract) {
    return cachedContract;
  }

  const { rpcUrl, privateKey, contractAddress } = getConfig();
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  cachedContract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);
  return cachedContract;
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

export function startBlockchainEventListeners() {
  if (listenersAttached) return;

  const contract = getContract();

  contract.on("RecordStored", (patientId, recordHash, storedBy, timestamp) => {
    // `patientId` is indexed in the contract, so it can arrive as a hash-like object.
    const patientRef =
      typeof patientId === "string" ? patientId : patientId?.hash || String(patientId);

    console.log(
      "[Blockchain Event] RecordStored:",
      JSON.stringify({
        patientId: patientRef,
        recordHash,
        storedBy,
        timestamp: Number(timestamp)
      })
    );
  });

  contract.on("ConsentGranted", (patientId, grantedBy, timestamp) => {
    const patientRef =
      typeof patientId === "string" ? patientId : patientId?.hash || String(patientId);

    console.log(
      "[Blockchain Event] ConsentGranted:",
      JSON.stringify({
        patientId: patientRef,
        grantedBy,
        timestamp: Number(timestamp)
      })
    );
  });

  listenersAttached = true;
  console.log("[Blockchain Listener] Listening for RecordStored and ConsentGranted events");
}
