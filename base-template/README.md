# FHEVM Hardhat Template

A complete Hardhat setup for developing privacy-preserving smart contracts using Fully Homomorphic Encryption (FHEVM).

## Quick Start

### Installation

```bash
npm install
```

### Compilation

```bash
npm run compile
```

### Testing

```bash
npm run test
```

### Deployment

```bash
# Local Hardhat network
npm run deploy:local

# Sepolia Testnet (requires .env configuration)
npm run deploy
```

## Project Structure

```
├── contracts/              # Solidity smart contracts
├── test/                   # Test files
├── scripts/                # Utility scripts
├── deploy/                 # Hardhat-deploy scripts
├── tasks/                  # Hardhat tasks
├── hardhat.config.ts      # Hardhat configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies
└── README.md              # This file
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the following variables:
- `SEPOLIA_RPC_URL` - Your Sepolia RPC endpoint
- `PRIVATE_KEY` - Your deployment account's private key
- `ETHERSCAN_API_KEY` - For contract verification

## Technology Stack

- **Solidity**: 0.8.24
- **Hardhat**: 2.19.0
- **FHEVM**: @fhevm/solidity 0.1.0
- **Testing**: Chai + Mocha
- **Type Safety**: TypeScript + TypeChain

## Features

- Full FHEVM integration
- TypeScript support
- Comprehensive testing setup
- Gas reporting
- Coverage analysis
- Multi-network deployment

## Documentation

For detailed information, see:
- [FHEVM Documentation](https://docs.zama.ai/fhevm/)
- [Hardhat Documentation](https://hardhat.org/)

## License

MIT License

---

Generated from FHEVM Template
