# Anonymous Copyright Protection

Privacy-preserving smart contracts for creative work authentication using Fully Homomorphic Encryption (FHEVM)

**Competition:** Zama Bounty Track December 2025 - Build The FHEVM Example Hub

---

## Overview

Anonymous Copyright Protection is a complete FHEVM example implementation that demonstrates privacy-preserving smart contract development using Fully Homomorphic Encryption. The project includes:

- **Complete smart contract** implementing copyright protection with encrypted data
- **Comprehensive test suite** (32+ tests) with 100% function coverage
- **Automation tools** for generating standalone example repositories
- **Documentation generator** for GitBook-compatible docs
- **Interactive CLI tasks** for contract interaction
- **Reusable base template** for new FHEVM projects
- **Extensive documentation** (3,400+ lines covering all aspects)

This is a production-ready example showing best practices for FHEVM development, testing, documentation, and automation.

---

## Key Features

### Smart Contract System

- **Anonymous Author Registration**: Register with encrypted numeric author ID (euint64)
- **Encrypted Work Registration**: Submit works with encrypted content hashes (euint32)
- **FHE-Based Verification**: Verify ownership without decrypting on-chain
- **Privacy-Preserving Disputes**: Challenge works with encrypted evidence
- **Complete Access Control**: Owner-only functions and author-only operations
- **Event-Driven Architecture**: All state changes emit events for transparency

### Automation & Scaffolding

- **Repository Generator** (`create-example.ts`): Generate standalone FHEVM projects
- **Documentation Generator** (`generate-docs.ts`): Create GitBook-compatible docs
- **Interactive Tasks**: 6 Hardhat tasks for contract operations
- **Base Template**: Complete, reusable Hardhat template with FHEVM setup

### Documentation

- **Project README**: This file with overview and quick start
- **Development Guide** (`GUIDE.md`): Installation, compilation, deployment
- **Usage Examples** (`EXAMPLES.md`): Practical code examples and patterns
- **Developer Guide** (`DEVELOPER_GUIDE.md`): Maintenance and extension guide
- **Architecture** (`ARCHITECTURE.md`): System design and patterns
- **Auto-Generated Docs**: GitBook-compatible documentation from code

### Testing Infrastructure

- **32+ Test Cases**: Comprehensive coverage of all functionality
- **100% Function Coverage**: Every public function tested
- **Mock FHEVM Support**: Tests run in Hardhat mock environment
- **Edge Case Testing**: Boundary values, special cases, error conditions
- **Event Verification**: All important events are tested

---

## Quick Start

### Installation

```bash
npm install
```

### Compilation

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Deploy Locally

```bash
npm run deploy:local
```

### Deploy to Sepolia

```bash
# Configure .env with SEPOLIA_RPC_URL and PRIVATE_KEY
npm run deploy
```

---

## Automation Tools

### Generate Standalone Example Repository

The `create-example.ts` script generates a complete, ready-to-use repository for the Anonymous Copyright Protection contract:

```bash
npm run create-example ./output/my-example
```

This creates:
- Complete project directory structure
- Smart contract (AnonymousCopyright.sol)
- Test suite (AnonymousCopyright.ts)
- Hardhat configuration
- Package.json with dependencies
- Example-specific README
- All support files

Generated project is immediately usable:

```bash
cd ./output/my-example
npm install
npm run compile
npm run test
npm run deploy:local
```

### Generate Documentation

The `generate-docs.ts` script creates GitBook-compatible documentation:

```bash
npm run generate-docs
```

Generates:
- Contract code and documentation
- Test examples and patterns
- Function reference with parameters
- Usage examples and best practices
- SUMMARY.md for GitBook navigation
- Output in `docs/` directory ready for GitBook

---

## Project Structure

```
AnonymousCopyright/
├── contracts/
│   └── AnonymousCopyright.sol              # Main smart contract (306 lines)
│
├── test/
│   └── AnonymousCopyright.ts               # Test suite (383 lines, 32+ tests)
│
├── scripts/
│   ├── create-example.ts                   # Repository generator (362 lines)
│   ├── generate-docs.ts                    # Documentation generator (391 lines)
│   ├── deploy.ts                           # Deployment script (61 lines)
│   └── README.md                           # Automation tools documentation
│
├── deploy/
│   └── 001_deploy_copyright.ts             # hardhat-deploy script
│
├── tasks/
│   └── copyright.ts                        # 6 interactive Hardhat tasks
│
├── base-template/                          # Reusable FHEVM template
│   ├── contracts/
│   ├── test/
│   ├── deploy/
│   ├── hardhat.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── docs/                                   # Auto-generated documentation
│   ├── copyright-protection.md
│   └── SUMMARY.md
│
├── Configuration Files
│   ├── hardhat.config.ts                   # Hardhat + FHEVM setup
│   ├── tsconfig.json                       # TypeScript configuration
│   └── package.json                        # Dependencies and scripts
│
└── Documentation
    ├── README.md                           # This file
    ├── GUIDE.md                            # Development guide
    ├── EXAMPLES.md                         # Usage examples
    ├── DEVELOPER_GUIDE.md                  # Maintenance guide
    ├── ARCHITECTURE.md                     # System architecture
    └── [other docs]
```

---

## Smart Contract Details

### Core Functions

#### Author Management

```solidity
// Register as anonymous author with encrypted identity
function registerAuthor(uint64 _authorId) external

// Retrieve author statistics
function getAuthorStats(address _author) external view
  returns (bool registered, uint256 workCount, uint256 totalDisputes, uint256 wonDisputes)
```

#### Work Management

```solidity
// Register a copyrighted work with encrypted hash
function registerWork(uint32 _contentHash, string _title, string _category)
  external returns (uint256 workId)

// Get work information (non-sensitive data)
function getWorkInfo(uint256 _workId) external view
  returns (address registrant, uint256 timestamp, bool verified, bool disputed, ...)
```

#### Verification & Disputes

```solidity
// Initiate encrypted verification
function requestVerifyWork(uint256 _workId, uint32 _contentHashToVerify) external

// File dispute against a work
function fileDispute(uint256 _workId, uint32 _challengerContentHash) external

// Resolve dispute via encrypted comparison
function resolveDispute(uint256 _workId, uint256 _disputeId) external
```

### Privacy Model

**Encrypted On-Chain:**
- Author ID: `euint64` (fully private)
- Content Hash: `euint32` (fully private)
- Verification Results: `ebool` (decrypted asynchronously)

**Public On-Chain:**
- Work Title: Enables search and discovery
- Category: Work classification
- Timestamp: Registration time
- Registrant Address: Account that registered work
- Dispute Count: Transparency on disputes

---

## Interactive Hardhat Tasks

### Register Author

```bash
npx hardhat copyright:register-author --author-id 123456 --network sepolia
```

### Register Work

```bash
npx hardhat copyright:register-work \
  --hash 42 \
  --title "My Work Title" \
  --category "Art" \
  --network sepolia
```

### Get Author Statistics

```bash
npx hardhat copyright:get-stats --address 0x... --network sepolia
```

### Get Work Information

```bash
npx hardhat copyright:get-work --id 1 --network sepolia
```

### File Dispute

```bash
npx hardhat copyright:file-dispute --work-id 1 --hash 42 --network sepolia
```

### View Contract Info

```bash
npx hardhat copyright:info --network sepolia
```

---

## Available NPM Scripts

```bash
# Compilation & Testing
npm run compile          # Compile Solidity contracts
npm run test            # Run test suite
npm run test:sepolia    # Run tests on Sepolia
npm run coverage        # Generate coverage report

# Deployment
npm run deploy          # Deploy to Sepolia testnet
npm run deploy:local    # Deploy to local Hardhat network
npm run node            # Start local Hardhat node

# Automation Tools
npm run create-example  # Generate standalone repository
npm run generate-docs   # Generate GitBook documentation

# Development
npm run typechain       # Generate TypeChain type definitions

# Hardhat Task Shortcuts
npm run copyright:info
npm run copyright:register-author
npm run copyright:register-work
npm run copyright:get-stats
npm run copyright:get-work
npm run copyright:file-dispute
```

---

## Technology Stack

### Smart Contracts
- **Solidity**: 0.8.24
- **FHE Library**: @fhevm/solidity 0.1.0
- **Network**: Ethereum Sepolia Testnet

### Development
- **Language**: TypeScript 5.0.0
- **Framework**: Hardhat 2.19.0
- **Runtime**: Node.js 16+

### Testing
- **Test Framework**: Chai + Mocha
- **FHE Testing**: @fhevm/hardhat-plugin
- **Coverage**: solidity-coverage
- **Gas Analysis**: hardhat-gas-reporter

### Automation
- **Type Generation**: TypeChain 8.0.0
- **Deployment**: hardhat-deploy 0.13.0
- **Plugin Integration**: @fhevm/hardhat-plugin

---

## Use Cases

### Anonymous Authors & Whistleblowers
Writers can register manuscripts without revealing identity, protecting against plagiarism while maintaining anonymity.

### Trade Secrets & Patents
Companies can register proprietary algorithms with encrypted fingerprints, proving prior art without disclosure.

### Creative Commons & Licensing
Artists can register works under pseudonyms while maintaining verifiable ownership for licensing.

### Academic Research
Researchers can timestamp discoveries before publication, protecting priority without premature disclosure.

### Whistleblower Protection
Journalists can timestamp sensitive documents with verifiable proof of possession without exposing themselves.

---

## Documentation Files

Start with these based on your needs:

- **00_READ_ME_FIRST.md** - Quick navigation guide
- **README.md** - This file, project overview
- **GUIDE.md** - Installation, compilation, testing, deployment
- **EXAMPLES.md** - Practical code examples and patterns
- **DEVELOPER_GUIDE.md** - Adding features, updating dependencies
- **ARCHITECTURE.md** - System design and architecture
- **scripts/README.md** - Automation tools documentation
- **SUBMISSION_CHECKLIST.md** - Competition requirements verification

---

## Security Considerations

### Privacy Guarantees
- Author identities remain encrypted as euint64 on-chain
- Content hashes encrypted as euint32, not exposed
- Verification logic uses FHE equality operations
- Work titles public only for discoverability

### Access Control
- registerAuthor(): One registration per address
- registerWork(): Only registered authors can register
- fileDispute(): Can't dispute own work
- markWorkAsVerified(): Owner-only function

### Best Practices
1. Use unique, high-entropy author IDs
2. Generate cryptographic content hashes
3. Store original works securely offline
4. Verify transactions on Etherscan
5. Keep private keys secure in .env

---

## Testing

### Run Full Test Suite

```bash
npm run test
```

### Run with Gas Report

```bash
REPORT_GAS=true npm run test
```

### Generate Coverage Report

```bash
npm run coverage
```

### Test Statistics

- **Total Test Cases**: 32+
- **Coverage**: 100% function coverage
- **Test Categories**:
  - Author Registration (4 tests)
  - Work Registration (7 tests)
  - Work Information (2 tests)
  - Work Verification (4 tests)
  - Dispute Filing (6 tests)
  - Author Statistics (2 tests)
  - Contract Initialization (2 tests)
  - Edge Cases (5 tests)

---

## Deployment

### Local Development

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy
npm run deploy:local
```

### Sepolia Testnet

1. Configure environment:
```bash
cp .env.example .env
# Edit .env with SEPOLIA_RPC_URL and PRIVATE_KEY
```

2. Get testnet ETH from faucet:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia

3. Deploy:
```bash
npm run deploy
```

4. Verify on Etherscan:
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

## Contributing

When contributing:

1. Read the DEVELOPER_GUIDE.md thoroughly
2. Follow the coding standards (TypeScript strict mode)
3. Write comprehensive tests for new features
4. Update documentation
5. Test locally before submitting
6. Create clear commit messages

---

## License

MIT License - Open source and free to use

---

## Resources

- **[FHEVM Documentation](https://docs.zama.ai/fhevm/)** - Fully Homomorphic Encryption on EVM
- **[Hardhat Documentation](https://hardhat.org/)** - Ethereum development framework
- **[Solidity Documentation](https://docs.soliditylang.org/)** - Smart contract language
- **[Ethereum Development](https://ethereum.org/en/developers/)** - Ethereum resources

---

## Support

For questions or issues:

1. Check existing documentation
2. Review the GUIDE.md for common questions
3. See DEVELOPER_GUIDE.md for troubleshooting
4. Review EXAMPLES.md for practical patterns

---

## Project Statistics

- **Total Code**: 10 files, 1,884 lines
- **Total Documentation**: 11 files, 3,400+ lines
- **Test Cases**: 32+ comprehensive tests
- **Function Coverage**: 100%
- **Hardhat Tasks**: 6 interactive tasks
- **Base Template**: Complete, reusable Hardhat setup

---

## Acknowledgments

Built with:
- **Zama FHEVM** - Fully Homomorphic Encryption for Ethereum
- **Hardhat** - Ethereum development framework
- **TypeScript** - Type-safe development

---

**Powered by FHEVM** - Bringing privacy to smart contracts through Fully Homomorphic Encryption

*Protecting creativity, preserving privacy, proving ownership.*
