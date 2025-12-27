#!/usr/bin/env ts-node

/**
 * create-example - CLI tool to generate standalone copyright protection example repositories
 *
 * This script creates a standalone, ready-to-use repository for the Anonymous Copyright Protection
 * smart contract system based on the Hardhat template.
 *
 * Usage:
 *   npx ts-node scripts/create-example.ts [output-dir]
 *   npm run create-example ./my-copyright-example
 *
 * Example:
 *   npx ts-node scripts/create-example.ts ./output/copyright-protection
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Color codes for terminal output
enum Color {
  Reset = '\x1b[0m',
  Green = '\x1b[32m',
  Blue = '\x1b[34m',
  Yellow = '\x1b[33m',
  Red = '\x1b[31m',
  Cyan = '\x1b[36m',
}

function log(message: string, color: Color = Color.Reset): void {
  console.log(`${color}${message}${Color.Reset}`);
}

function error(message: string): never {
  log(`❌ Error: ${message}`, Color.Red);
  process.exit(1);
}

function success(message: string): void {
  log(`✅ ${message}`, Color.Green);
}

function info(message: string): void {
  log(`ℹ️  ${message}`, Color.Blue);
}

function section(title: string): void {
  log(`\n${'='.repeat(60)}`, Color.Cyan);
  log(`  ${title}`, Color.Cyan);
  log(`${'='.repeat(60)}\n`, Color.Cyan);
}

// Get output directory from command line arguments
const outputDir = process.argv[2] || './copyright-protection-example';
const absoluteOutputDir = path.resolve(outputDir);
const projectRoot = path.resolve(__dirname, '..');

section('Anonymous Copyright Protection Example Generator');

info(`Creating example in: ${absoluteOutputDir}`);

// Check if output directory already exists
if (fs.existsSync(absoluteOutputDir)) {
  error(`Output directory already exists: ${absoluteOutputDir}`);
}

try {
  // Step 1: Create directory structure
  info('Creating directory structure...');
  const dirs = [
    absoluteOutputDir,
    path.join(absoluteOutputDir, 'contracts'),
    path.join(absoluteOutputDir, 'test'),
    path.join(absoluteOutputDir, 'scripts'),
    path.join(absoluteOutputDir, 'deploy'),
    path.join(absoluteOutputDir, 'tasks'),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  success('Directory structure created');

  // Step 2: Copy contract
  info('Copying smart contract...');
  const contractSource = path.join(projectRoot, 'contracts', 'AnonymousCopyright.sol');
  const contractDest = path.join(absoluteOutputDir, 'contracts', 'AnonymousCopyright.sol');

  if (!fs.existsSync(contractSource)) {
    error(`Contract not found: ${contractSource}`);
  }

  fs.copyFileSync(contractSource, contractDest);
  success('Contract copied');

  // Step 3: Copy test file
  info('Copying test suite...');
  const testSource = path.join(projectRoot, 'test', 'AnonymousCopyright.ts');
  const testDest = path.join(absoluteOutputDir, 'test', 'AnonymousCopyright.ts');

  if (!fs.existsSync(testSource)) {
    error(`Test file not found: ${testSource}`);
  }

  fs.copyFileSync(testSource, testDest);
  success('Test suite copied');

  // Step 4: Copy configuration files
  info('Copying configuration files...');
  const filesToCopy = [
    { src: 'hardhat.config.ts', dest: 'hardhat.config.ts' },
    { src: 'tsconfig.json', dest: 'tsconfig.json' },
    { src: '.env.example', dest: '.env.example' },
    { src: '.gitignore', dest: '.gitignore' },
    { src: 'LICENSE', dest: 'LICENSE' },
  ];

  filesToCopy.forEach(({ src, dest }) => {
    const srcPath = path.join(projectRoot, src);
    const destPath = path.join(absoluteOutputDir, dest);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  });
  success('Configuration files copied');

  // Step 5: Copy deployment script
  info('Creating deployment script...');
  const deployScript = `import { ethers } from "hardhat";

/**
 * Deploy the AnonymousCopyright contract
 *
 * Example: Generated from Anonymous Copyright Protection repository
 */
async function main() {
  console.log("Deploying AnonymousCopyright contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const contract = await ethers.deployContract("AnonymousCopyright");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ Contract deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;

  fs.writeFileSync(path.join(absoluteOutputDir, 'scripts', 'deploy.ts'), deployScript);
  success('Deployment script created');

  // Step 6: Create package.json
  info('Creating package.json...');
  const packageJson = {
    name: "anonymous-copyright-protection",
    version: "1.0.0",
    description: "Privacy-preserving copyright protection with Fully Homomorphic Encryption",
    main: "index.js",
    scripts: {
      compile: "hardhat compile",
      test: "hardhat test",
      "test:sepolia": "hardhat test --network sepolia",
      deploy: "hardhat run scripts/deploy.ts --network sepolia",
      "deploy:local": "hardhat run scripts/deploy.ts --network hardhat",
      node: "hardhat node",
      typechain: "hardhat typechain",
      coverage: "hardhat coverage",
    },
    keywords: [
      "fhevm",
      "copyright",
      "privacy",
      "blockchain",
      "fully-homomorphic-encryption",
    ],
    license: "MIT",
    devDependencies: {
      "@fhevm/hardhat-plugin": "^0.1.0",
      "@nomicfoundation/hardhat-chai-matchers": "^2.0.0",
      "@nomicfoundation/hardhat-ethers": "^3.0.0",
      "@types/chai": "^4.3.0",
      "@types/mocha": "^10.0.0",
      "@types/node": "^20.0.0",
      "@typechain/hardhat": "^9.0.0",
      chai: "^4.3.0",
      hardhat: "^2.19.0",
      typescript: "^5.0.0",
    },
    dependencies: {
      "@fhevm/solidity": "^0.1.0",
      dotenv: "^16.3.1",
      ethers: "^6.9.0",
    },
  };

  fs.writeFileSync(
    path.join(absoluteOutputDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  success('package.json created');

  // Step 7: Create example-specific README
  info('Creating README...');
  const readme = `# Anonymous Copyright Protection Example

Privacy-preserving smart contracts for copyright protection using Fully Homomorphic Encryption (FHEVM).

## Features

- **Encrypted Author Identity**: Register with an encrypted numeric author ID
- **Encrypted Work Registration**: Submit works with encrypted content hashes
- **Privacy-Preserving Verification**: Verify ownership without revealing original content
- **Dispute Resolution**: Challenge works with encrypted evidence
- **On-Chain Privacy**: Author IDs and content hashes remain encrypted

## Quick Start

### Installation

\`\`\`bash
npm install
\`\`\`

### Compilation

\`\`\`bash
npm run compile
\`\`\`

### Testing

\`\`\`bash
npm run test
\`\`\`

### Deployment (Local)

\`\`\`bash
npm run deploy:local
\`\`\`

### Deployment (Sepolia Testnet)

1. Set up your \`.env\` file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Fill in your configuration:
   - \`SEPOLIA_RPC_URL\` - Your Sepolia RPC endpoint
   - \`PRIVATE_KEY\` - Your deployment account's private key

3. Deploy:
   \`\`\`bash
   npm run deploy
   \`\`\`

## Contract Functions

### Author Registration
\`\`\`solidity
registerAuthor(uint64 _authorId) - Register as anonymous author
\`\`\`

### Work Registration
\`\`\`solidity
registerWork(uint32 _contentHash, string _title, string _category) - Register a work
\`\`\`

### Verification
\`\`\`solidity
requestVerifyWork(uint256 _workId, uint32 _contentHashToVerify) - Verify work ownership
\`\`\`

### Disputes
\`\`\`solidity
fileDispute(uint256 _workId, uint32 _challengerContentHash) - File a dispute
\`\`\`

## Architecture

The contract uses Fully Homomorphic Encryption to keep sensitive data encrypted on-chain:

- **euint32**: Encrypted 32-bit integers (for content hashes)
- **euint64**: Encrypted 64-bit integers (for author IDs)
- **ebool**: Encrypted booleans (for verification results)

## Privacy Model

**Encrypted On-Chain:**
- Author ID (\`euint64\`)
- Content Hash (\`euint32\`)

**Public On-Chain:**
- Work Title
- Category
- Timestamp
- Registrant Address

## Technologies

- Solidity 0.8.24
- Hardhat
- FHEVM (Fully Homomorphic Encryption for EVM)
- TypeScript

## Network

Ethereum Sepolia Testnet (Chain ID: 11155111)

## License

MIT License

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm/)
- [Hardhat Documentation](https://hardhat.org/)

---

Generated from Anonymous Copyright Protection template
`;

  fs.writeFileSync(path.join(absoluteOutputDir, 'README.md'), readme);
  success('README created');

  // Step 8: Create .env file from template
  info('Creating .env file from template...');
  const envTemplate = fs.readFileSync(path.join(projectRoot, '.env.example'), 'utf-8');
  fs.writeFileSync(path.join(absoluteOutputDir, '.env'), envTemplate);
  success('.env file created');

  section('Generation Complete!');

  log('\n📁 Project structure:');
  log(`   ${path.relative(process.cwd(), absoluteOutputDir)}/`);
  log('   ├── contracts/');
  log('   ├── test/');
  log('   ├── scripts/');
  log('   ├── hardhat.config.ts');
  log('   ├── tsconfig.json');
  log('   ├── package.json');
  log('   └── README.md\n');

  log('📋 Next steps:', Color.Yellow);
  log(`   1. cd ${path.relative(process.cwd(), absoluteOutputDir)}`);
  log('   2. npm install');
  log('   3. npm run compile');
  log('   4. npm run test\n');

  log('🚀 To deploy:', Color.Yellow);
  log('   npm run deploy:local   # Local network');
  log('   npm run deploy         # Sepolia testnet (requires .env configuration)\n');

  success('Example repository generated successfully!');

} catch (err) {
  error(`Failed to create example: ${err instanceof Error ? err.message : String(err)}`);
}
