// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HealthRecordRegistry {
    address public immutable owner;

    // patientId => list of record hashes
    mapping(string => bytes32[]) private patientRecordHashes;

    // patientId => consent flag
    mapping(string => bool) private patientConsent;

    // patientId => consent timestamp (unix)
    mapping(string => uint256) private consentTimestamp;

    event RecordStored(
        string indexed patientId,
        bytes32 indexed recordHash,
        address indexed storedBy,
        uint256 timestamp
    );

    event ConsentGranted(
        string indexed patientId,
        address indexed grantedBy,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only backend wallet can write");
        _;
    }

    constructor(address backendWallet) {
        require(backendWallet != address(0), "Invalid backend wallet");
        owner = backendWallet;
    }

    function storeRecordHash(string calldata patientId, bytes32 recordHash) external onlyOwner {
        require(bytes(patientId).length > 0, "patientId required");
        require(recordHash != bytes32(0), "recordHash required");

        patientRecordHashes[patientId].push(recordHash);
        emit RecordStored(patientId, recordHash, msg.sender, block.timestamp);
    }

    function grantConsent(string calldata patientId) external onlyOwner {
        require(bytes(patientId).length > 0, "patientId required");

        patientConsent[patientId] = true;
        consentTimestamp[patientId] = block.timestamp;
        emit ConsentGranted(patientId, msg.sender, block.timestamp);
    }

    function verifyRecordHash(string calldata patientId, bytes32 recordHash) external view returns (bool) {
        bytes32[] memory hashes = patientRecordHashes[patientId];
        for (uint256 i = 0; i < hashes.length; i++) {
            if (hashes[i] == recordHash) {
                return true;
            }
        }
        return false;
    }

    function getRecordHashes(string calldata patientId) external view returns (bytes32[] memory) {
        return patientRecordHashes[patientId];
    }

    function hasConsent(string calldata patientId) external view returns (bool) {
        return patientConsent[patientId];
    }

    function getConsentTimestamp(string calldata patientId) external view returns (uint256) {
        return consentTimestamp[patientId];
    }
}
