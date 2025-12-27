# Development Guide - Anonymous Copyright Protection

## Overview

This guide covers the setup, development, testing, and deployment of the Anonymous Copyright Protection smart contract system using Fully Homomorphic Encryption (FHE).

## Project Structure

```
├── contracts/
│   └── AnonymousCopyright.sol          # Main contract implementation
├── test/
│   └── AnonymousCopyright.ts           # Comprehensive test suite
├── scripts/
│   └── deploy.ts                       # Deployment script
├── hardhat.config.ts                   # Hardhat configuration
├── tsconfig.json                       # TypeScript configuration
├── package.json                        # Dependencies and scripts
├── .env.example                        # Environment variables template
├── LICENSE                             # BSD 3-Clause Clear License
└── README.md                           # Project documentation
```

## Prerequisites

- Node.js v16 or higher
- npm or yarn package manager
- Git for version control

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AnonymousCopyright
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `SEPOLIA_RPC_URL`: Your Sepolia RPC endpoint
- `PRIVATE_KEY`: Your deployment account's private key
- `ETHERSCAN_API_KEY`: For contract verification

## Compilation

Compile the Solidity contracts:

```bash
npm run compile
```

This generates TypeChain types in the `types/` directory for type-safe contract interactions.

## Testing

Run the complete test suite:

```bash
npm test
```

Run tests with gas report:

```bash
REPORT_GAS=true npm test
```

Run tests on Sepolia (requires configuration):

```bash
npm run test:sepolia
```

Generate coverage report:

```bash
npm run coverage
```

## Test Coverage

The test suite includes comprehensive coverage of:

- **Author Registration**: Registration, duplicate prevention, event emission
- **Work Registration**: Submission, validation, metadata handling
- **Work Verification**: Permission checks, state management
- **Dispute Filing**: Dispute submission, validation, conflict prevention
- **Author Statistics**: Work tracking, dispute counting
- **Edge Cases**: Large numbers, special characters, boundary conditions

Each test file includes JSDoc comments explaining the test purpose and expected behavior.

## Contract Functions

### Author Management

#### `registerAuthor(uint64 _authorId)`
Register as an anonymous author with an encrypted identity.

**Parameters:**
- `_authorId`: Numeric identifier for the author (will be encrypted)

**Events Emitted:**
- `AuthorRegistered(address indexed author, uint256 timestamp)`

**Reverts:**
- "Already registered" - If the address has already registered

#### `getAuthorStats(address _author)`
Retrieve author profile information and statistics.

**Returns:**
- `registered`: Whether the author is registered
- `workCount`: Number of works registered
- `totalDisputes`: Total disputes filed and received
- `wonDisputes`: Number of disputes won

#### `isRegisteredAuthor(address _author)`
Check if an address is a registered author.

**Returns:** Boolean indicating registration status

### Work Management

#### `registerWork(uint32 _contentHash, string _title, string _category)`
Register an original work with encrypted content hash.

**Parameters:**
- `_contentHash`: Encrypted hash of the work content
- `_title`: Human-readable title of the work
- `_category`: Category classification (e.g., "Literature", "Music")

**Returns:** Unique work ID

**Events Emitted:**
- `WorkRegistered(uint256 indexed workId, address indexed registrant, string title, uint256 timestamp)`

**Reverts:**
- "Author not registered" - If caller hasn't registered as author
- "Title required" - If title is empty
- "Category required" - If category is empty

#### `getWorkInfo(uint256 _workId)`
Retrieve non-sensitive work information.

**Returns:**
- `registrant`: Address that registered the work
- `timestamp`: Registration timestamp
- `verified`: Verification status
- `disputed`: Whether work has active disputes
- `disputeCount`: Number of disputes
- `title`: Work title
- `category`: Work category

#### `getAuthorWorks(address _author)`
Get all work IDs registered by an author.

**Returns:** Array of work IDs

#### `markWorkAsVerified(uint256 _workId)`
Owner-only function to mark a work as verified.

**Events Emitted:**
- `WorkVerified(uint256 indexed workId, address indexed verifier)`

**Reverts:**
- "Not authorized" - If caller is not the contract owner
- "Invalid work ID" - If work ID is invalid

### Dispute Management

#### `fileDispute(uint256 _workId, uint32 _challengerContentHash)`
File a dispute against a work claiming prior ownership.

**Parameters:**
- `_workId`: ID of the work being disputed
- `_challengerContentHash`: Encrypted hash of the challenger's version

**Events Emitted:**
- `DisputeFiled(uint256 indexed workId, address indexed challenger, uint256 disputeId)`

**Reverts:**
- "Author not registered" - If caller hasn't registered as author
- "Cannot dispute own work" - If filing dispute against own work
- "Invalid work ID" - If work ID is invalid

#### `getDisputeInfo(uint256 _workId, uint256 _disputeId)`
Retrieve information about a specific dispute.

**Returns:**
- `challenger`: Address of the dispute filer
- `timestamp`: When dispute was filed
- `resolved`: Resolution status
- `winner`: Address of winning party (if resolved)

#### `getDisputeCount(uint256 _workId)`
Get the number of disputes for a work.

**Returns:** Number of active disputes

## Privacy Model

### Encrypted Data (On-Chain)
- Author Identity (`euint64`)
- Content Hash (`euint32`)
- Dispute Evidence (`euint32`)

### Public Data (On-Chain)
- Work Title
- Category
- Registration Timestamp
- Registrant Address
- Dispute Count

### FHE Operations
The contract uses Fully Homomorphic Encryption for:
- Equality comparisons on encrypted hashes
- Asynchronous decryption via FHE gateway
- Privacy-preserving verification logic

## Deployment

### Local Testing Network

Start a local hardhat node:
```bash
npm run node
```

In another terminal, deploy to local network:
```bash
npm run deploy:local
```

### Sepolia Testnet

Deploy to Sepolia:
```bash
npm run deploy
```

The deployment script will:
1. Compile contracts
2. Deploy AnonymousCopyright contract
3. Log the contract address
4. Save deployment information

### Contract Verification

Verify contract on Etherscan:
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Adding New Features

### Adding a New Function

1. Add the function to `AnonymousCopyright.sol`
2. Create comprehensive tests in `test/AnonymousCopyright.ts`
3. Update this guide with function documentation
4. Ensure TypeScript compilation passes: `npm run typechain`

### Best Practices

- Use FHE operations for sensitive data
- Emit events for all state changes
- Validate inputs thoroughly
- Document all functions with comments
- Add corresponding tests before deployment
- Test against mock FHEVM environment

## Troubleshooting

### Common Issues

**"Module not found" errors:**
```bash
npm install
npm run typechain
```

**Tests skip on Sepolia:**
Tests only run against mock FHEVM environments. Use local hardhat node for testing.

**Compilation errors:**
Ensure Solidity version matches in `hardhat.config.ts`:
```
solidity: "0.8.24"
```

**Deployment fails:**
- Check `.env` file has valid `PRIVATE_KEY`
- Ensure account has sufficient testnet ETH
- Verify `SEPOLIA_RPC_URL` is correct

## Security Considerations

1. **Private Keys**: Never commit `.env` file to version control
2. **Encrypted Data**: Content hashes are encrypted but work titles remain public
3. **FHE Limitations**: Certain operations not possible on encrypted data
4. **Testing**: Always test thoroughly in mock environment before mainnet
5. **Access Control**: Only contract owner can mark works as verified

## Performance Optimization

- Batch multiple work registrations when possible
- Use indexed events for efficient filtering
- Consider pagination for large result sets
- Monitor gas consumption with gas reporter

## Additional Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm/)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Ethereum Development Guide](https://ethereum.org/en/developers/)

## Support and Contributing

For questions or contributions:
1. Check existing issues and discussions
2. Review code style guidelines
3. Ensure all tests pass before submitting changes
4. Document new features comprehensively

## License

This project is licensed under the BSD 3-Clause Clear License. See LICENSE file for details.
