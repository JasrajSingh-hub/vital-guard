# VitalGuard Blockchain Integration (Backend + Contract)

## 1) Install dependencies
```bash
cd backend
npm install
```

## 2) Configure environment
Create `backend/.env` (or copy from `.env.example`) and set:
- `SEPOLIA_RPC_URL`
- `PRIVATE_KEY` (backend wallet)
- `CONTRACT_ADDRESS` (after deployment)

## 3) Compile contract
```bash
npm run chain:compile
```

## 4) Deploy to Sepolia
```bash
npm run chain:deploy:sepolia
```
Copy the deployed address and set it in:
- `CONTRACT_ADDRESS=0x...` in `backend/.env`

## 5) Start backend
```bash
npm start
```

## API endpoints added
- `POST /api/blockchain/records`
  - body: `{ "patientId": "P001", "encryptedRecord": "..." }`
  - hashes record with SHA256, stores hash on-chain, returns tx hash

- `POST /api/blockchain/verify`
  - body: `{ "patientId": "P001", "encryptedRecord": "..." }`
  - re-hashes and verifies hash on-chain

- `POST /api/blockchain/consent`
  - body: `{ "patientId": "P001" }`
  - logs patient consent on-chain
