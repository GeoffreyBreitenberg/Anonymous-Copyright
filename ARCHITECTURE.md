# Architecture - Anonymous Copyright Protection

## System Architecture Overview

This document describes the architecture, design patterns, and technical decisions behind the Anonymous Copyright Protection system.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Smart Contract Design](#smart-contract-design)
3. [Privacy Model](#privacy-model)
4. [Automation Architecture](#automation-architecture)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Architecture](#deployment-architecture)
7. [Type Safety System](#type-safety-system)
8. [Security Considerations](#security-considerations)

---

## High-Level Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  (Frontend / CLI Tasks / Web3 Interactions)                 │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  Smart Contract Layer                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │       AnonymousCopyright Contract                   │   │
│  │  - Author Registration (euint64)                    │   │
│  │  - Work Registration (euint32)                      │   │
│  │  - FHE Verification                                 │   │
│  │  - Dispute Resolution                               │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              FHEVM (Fully Homomorphic Encryption)            │
│  - Encrypted Computation                                     │
│  - Privacy-Preserving Operations                             │
│  - FHE Gateway for Decryption                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  Blockchain Layer                            │
│  (Ethereum Sepolia Testnet)                                  │
│  - Immutable Storage                                         │
│  - Transaction Processing                                    │
│  - Event Emissions                                           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Author Registration Flow**
   ```
   User → Wallet → Contract.registerAuthor(authorId)
        → FHE.asEuint64(authorId) → Encrypted Storage
        → FHE.allowThis() + FHE.allow(user)
        → Event Emission
   ```

2. **Work Registration Flow**
   ```
   User → Hash Content → Encrypted Input
        → Contract.registerWork(hash, title, category)
        → Link to Author's Encrypted ID
        → Store in Blockchain
        → Grant Permissions
        → Emit WorkRegistered Event
   ```

3. **Verification Flow**
   ```
   User → Submit Hash → Contract.requestVerifyWork()
        → FHE.eq(storedHash, submittedHash) → ebool
        → Request Async Decryption
        → Gateway Decryption
        → Callback with Result
        → Emit VerificationResult Event
   ```

---

## Smart Contract Design

### Contract Structure

```solidity
AnonymousCopyright
├── State Variables
│   ├── owner (address)
│   ├── workCounter (uint256)
│   ├── works (mapping)
│   ├── disputes (mapping)
│   ├── authors (mapping)
│   └── authorWorks (mapping)
│
├── Structs
│   ├── OriginalWork
│   │   ├── encryptedContentHash (euint32)
│   │   ├── encryptedAuthorId (euint64)
│   │   ├── registrant (address)
│   │   ├── timestamp (uint256)
│   │   └── metadata (string)
│   │
│   ├── DisputeRecord
│   │   ├── challenger (address)
│   │   ├── challengerContentHash (euint32)
│   │   └── status info
│   │
│   └── AuthorProfile
│       ├── encryptedAuthorId (euint64)
│       ├── registered (bool)
│       └── statistics
│
├── Functions
│   ├── Public/External
│   │   ├── registerAuthor()
│   │   ├── registerWork()
│   │   ├── requestVerifyWork()
│   │   ├── fileDispute()
│   │   └── resolveDispute()
│   │
│   └── View Functions
│       ├── getWorkInfo()
│       ├── getAuthorStats()
│       ├── getDisputeInfo()
│       └── isRegisteredAuthor()
│
└── Events
    ├── WorkRegistered
    ├── AuthorRegistered
    ├── DisputeFiled
    ├── DisputeResolved
    └── VerificationResult
```

### Design Patterns

#### 1. **Encrypted Storage Pattern**

```solidity
// Store sensitive data as encrypted types
euint32 private encryptedContentHash;
euint64 private encryptedAuthorId;

// Always grant dual permissions
function storeEncryptedData(euint32 data) external {
    FHE.allowThis(data);        // Contract reads
    FHE.allow(data, msg.sender); // User decrypts
}
```

#### 2. **Permission Management Pattern**

```solidity
// Consistent permission granting
function setEncryptedValue(euint32 value) external {
    storedValue = value;
    FHE.allowThis(storedValue);           // Critical
    FHE.allow(storedValue, msg.sender);   // Critical
}
```

#### 3. **Access Control Pattern**

```solidity
// Modifier-based access control
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _;
}

modifier onlyRegisteredAuthor() {
    require(authors[msg.sender].registered, "Not registered");
    _;
}
```

#### 4. **Event-Driven Architecture**

```solidity
// Emit events for all state changes
function registerWork(...) external {
    // ... logic ...
    emit WorkRegistered(workId, registrant, title, timestamp);
}
```

---

## Privacy Model

### What's Encrypted

| Data Type | Storage Type | Privacy Level |
|-----------|--------------|---------------|
| Author ID | `euint64` | Fully Private |
| Content Hash | `euint32` | Fully Private |
| Verification Result | `ebool` (temporary) | Private until decrypted |

### What's Public

| Data Type | Storage Type | Visibility |
|-----------|--------------|------------|
| Work Title | `string` | Public |
| Category | `string` | Public |
| Timestamp | `uint256` | Public |
| Registrant Address | `address` | Public |
| Dispute Count | `uint256` | Public |

### Privacy Guarantees

1. **Author Identity**: Encrypted as `euint64`, never revealed on-chain
2. **Content Hash**: Encrypted as `euint32`, comparisons via FHE
3. **Verification**: Results via async decryption, not stored
4. **Dispute Evidence**: Encrypted until resolution

### FHE Operations

```solidity
// Equality comparison (encrypted)
ebool isMatch = FHE.eq(
    work.encryptedContentHash,
    encryptedProvidedHash
);

// Asynchronous decryption
bytes32[] memory cts = new bytes32[](1);
cts[0] = FHE.toBytes32(isMatch);
FHE.requestDecryption(cts, this.callback.selector);
```

---

## Automation Architecture

### Script Architecture

```
scripts/
├── create-example.ts
│   ├── CLI Argument Parsing
│   ├── Directory Creation
│   ├── File Copying Engine
│   ├── Template Replacement
│   └── Output Validation
│
├── generate-docs.ts
│   ├── Code Extraction
│   ├── Documentation Generation
│   ├── Markdown Formatting
│   └── GitBook Structure
│
└── deploy.ts
    ├── Network Detection
    ├── Account Validation
    ├── Contract Deployment
    └── Verification Helper
```

### Automation Flow

#### Repository Generation Flow

```
User Command
    ↓
create-example.ts
    ├→ Parse Arguments
    ├→ Validate Output Path
    ├→ Create Directory Structure
    ├→ Copy Base Template
    ├→ Copy Contract & Tests
    ├→ Generate package.json
    ├→ Generate README
    ├→ Generate .env
    └→ Display Instructions
```

#### Documentation Generation Flow

```
generate-docs.ts
    ├→ Read Contract Source
    ├→ Extract JSDoc Comments
    ├→ Read Test Source
    ├→ Extract Examples
    ├→ Generate Markdown
    │   ├→ Overview Section
    │   ├→ Contract Code Section
    │   ├→ Test Examples Section
    │   ├→ Function Reference
    │   └→ Usage Examples
    ├→ Generate SUMMARY.md
    └→ Write to docs/
```

---

## Testing Strategy

### Test Architecture

```
Test Suite
├── Unit Tests (Function-level)
│   ├── Author Registration
│   ├── Work Registration
│   ├── Verification
│   └── Dispute Management
│
├── Integration Tests (Multi-function)
│   ├── Registration → Verification
│   ├── Work → Dispute → Resolution
│   └── Multi-author Scenarios
│
└── Edge Case Tests
    ├── Boundary Values
    ├── Error Conditions
    └── Permission Checks
```

### Test Patterns

#### 1. **Fixture Pattern**

```typescript
async function deployFixture() {
  const factory = await ethers.getContractFactory("Contract");
  const contract = await factory.deploy();
  return { contract, contractAddress };
}

beforeEach(async function () {
  ({ contract } = await deployFixture());
});
```

#### 2. **Signer Management**

```typescript
type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

before(async function () {
  const ethSigners = await ethers.getSigners();
  signers = { deployer: ethSigners[0], ... };
});
```

#### 3. **Mock FHE Testing**

```typescript
beforeEach(async function () {
  if (!fhevm.isMock) {
    this.skip(); // Only run in mock environment
  }
});

const encrypted = await fhevm
  .createEncryptedInput(contractAddr, signer.address)
  .add32(clearValue)
  .encrypt();
```

---

## Deployment Architecture

### Network Configuration

```typescript
networks: {
  hardhat: {
    chainId: 31337,
    accounts: { mnemonic: MNEMONIC }
  },
  sepolia: {
    chainId: 11155111,
    url: SEPOLIA_RPC_URL,
    accounts: { mnemonic: MNEMONIC }
  }
}
```

### Deployment Strategy

1. **Local Development**
   - Hardhat Network (in-memory)
   - Instant transactions
   - Mock FHEVM support

2. **Testnet (Sepolia)**
   - Persistent blockchain
   - Real FHE gateway
   - Public verification

3. **Deployment Process**
   ```
   Compile → Test → Deploy → Verify
      ↓       ↓       ↓        ↓
   artifacts tests  on-chain etherscan
   ```

---

## Type Safety System

### TypeScript Configuration

```typescript
{
  "strict": true,              // All strict checks
  "noImplicitAny": true,       // No implicit any
  "esModuleInterop": true,     // Module compatibility
  "target": "es2022"           // Modern JavaScript
}
```

### TypeChain Integration

```
Smart Contracts (Solidity)
        ↓ Compile
    Artifacts (JSON)
        ↓ TypeChain
    Type Definitions (TypeScript)
        ↓ Import
    Type-Safe Interactions
```

**Benefits:**
- Compile-time type checking
- Autocomplete in IDEs
- Catch errors before runtime
- Better refactoring support

---

## Security Considerations

### Smart Contract Security

1. **Access Control**
   ```solidity
   modifier onlyOwner() { ... }
   modifier onlyRegisteredAuthor() { ... }
   ```

2. **Input Validation**
   ```solidity
   require(bytes(_title).length > 0, "Title required");
   require(_workId <= workCounter, "Invalid work ID");
   ```

3. **Reentrancy Protection**
   - State updates before external calls
   - No complex call chains

4. **Integer Overflow**
   - Solidity 0.8.24 has built-in checks
   - No manual SafeMath needed

### Privacy Security

1. **Encrypted Data**
   - Never decrypt on-chain
   - Use FHE gateway for results
   - Grant minimum permissions

2. **Permission Management**
   - `allowThis()` for contract reads
   - `allow(user)` for user decryption
   - Remove permissions when no longer needed

3. **Access Patterns**
   - Work titles public (for discovery)
   - Content hashes encrypted
   - Author IDs encrypted

---

## Performance Considerations

### Gas Optimization

1. **Storage Optimization**
   - Pack structs efficiently
   - Use mappings over arrays
   - Minimize storage writes

2. **Function Optimization**
   - View functions don't cost gas
   - Batch operations when possible
   - Use events for off-chain data

3. **FHE Costs**
   - FHE operations are expensive
   - Minimize encrypted comparisons
   - Use async decryption

### Scalability

**Current Limitations:**
- On-chain storage costs
- FHE computation costs
- Sequential work registration

**Future Optimizations:**
- Off-chain storage (IPFS)
- Layer 2 solutions
- Batch registration

---

## Design Decisions

### Why Encrypted Types?

**Decision:** Use `euint32` for content hashes, `euint64` for author IDs

**Rationale:**
- Privacy: Never expose sensitive data
- Verifiability: Can compare without decryption
- Immutability: Encrypted data on-chain forever

**Trade-offs:**
- Higher gas costs
- Limited operations
- Requires FHE gateway

### Why Public Titles?

**Decision:** Store work titles as plain strings

**Rationale:**
- Discoverability: Users can search
- UX: Easier identification
- Balance: Privacy where it matters

**Trade-offs:**
- Some metadata exposed
- Can't hide work existence

### Why Async Verification?

**Decision:** Use asynchronous decryption for verification

**Rationale:**
- Security: Decryption off-chain
- Flexibility: Complex verification logic
- Scalability: Don't block on-chain

**Trade-offs:**
- Two-step process
- Callback complexity
- Event-based results

---

## Future Architecture

### Planned Enhancements

1. **IPFS Integration**
   - Store work content off-chain
   - Only hash on-chain
   - Reduce storage costs

2. **Layer 2 Deployment**
   - Lower transaction costs
   - Faster finality
   - Same security guarantees

3. **DAO Governance**
   - Community dispute resolution
   - Voting mechanisms
   - Decentralized moderation

4. **NFT Minting**
   - Mint NFT for verified works
   - Transferable ownership
   - Royalty management

---

## Conclusion

The Anonymous Copyright Protection architecture balances privacy, usability, and security through:

- **Privacy**: FHE for sensitive data
- **Transparency**: Public metadata for discovery
- **Security**: Multiple layers of access control
- **Usability**: Clear APIs and documentation
- **Maintainability**: Modular, well-tested code

---

**Last Updated**: December 2025
**Version**: 1.0.0
**License**: MIT
