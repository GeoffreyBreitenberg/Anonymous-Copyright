# Automation Scripts

This directory contains automation scripts for generating standalone example repositories and documentation for the Anonymous Copyright Protection project.

## Available Scripts

### 1. `create-example.ts` - Standalone Repository Generator

Generates a complete, ready-to-use standalone repository for the Anonymous Copyright Protection smart contract system.

**Usage:**
```bash
# Using npm script (recommended)
npm run create-example ./output/my-copyright-example

# Or directly with ts-node
npx ts-node scripts/create-example.ts ./output/my-copyright-example
```

**What It Does:**
- Creates a complete project directory structure
- Copies the AnonymousCopyright smart contract
- Copies the comprehensive test suite
- Copies all configuration files (hardhat.config.ts, tsconfig.json, .env.example)
- Generates deployment script
- Creates package.json with all dependencies
- Generates example-specific README.md
- Sets up .gitignore

**Output Structure:**
```
my-copyright-example/
├── contracts/
│   └── AnonymousCopyright.sol
├── test/
│   └── AnonymousCopyright.ts
├── scripts/
│   └── deploy.ts
├── deploy/
├── tasks/
├── hardhat.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── .env
├── .gitignore
├── LICENSE
└── README.md
```

**Example Workflow:**
```bash
# Generate example
npm run create-example ./my-example

# Navigate to example
cd my-example

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy locally
npm run deploy:local
```

### 2. `generate-docs.ts` - Documentation Generator

Generates GitBook-formatted documentation from smart contract and test files.

**Usage:**
```bash
# Using npm script (recommended)
npm run generate-docs

# Or directly with ts-node
npx ts-node scripts/generate-docs.ts
```

**What It Does:**
- Extracts smart contract source code
- Extracts test file examples
- Generates comprehensive markdown documentation
- Creates GitBook-compatible structure
- Generates SUMMARY.md for navigation
- Includes function references and usage examples
- Adds security considerations and best practices

**Output:**
```
docs/
├── copyright-protection.md    # Main documentation
└── SUMMARY.md                 # GitBook navigation
```

**Generated Documentation Includes:**
- Overview of the project
- Smart contract source code
- Test suite examples
- Key function documentation
- Usage examples with code snippets
- Security considerations
- Common pitfalls
- Deployment instructions
- Testing guide

**GitBook Integration:**
```bash
# Generate docs
npm run generate-docs

# Copy to GitBook project
cp -r docs/* /path/to/gitbook/project/

# Build GitBook
gitbook build
```

### 3. `deploy.ts` - Deployment Script

Standard Hardhat deployment script for the AnonymousCopyright contract.

**Usage:**
```bash
# Deploy to local hardhat network
npm run deploy:local

# Deploy to Sepolia testnet
npm run deploy

# Deploy to specific network
npx hardhat run scripts/deploy.ts --network sepolia
```

**Features:**
- Checks deployer account balance
- Deploys contract with proper error handling
- Verifies owner is set correctly
- Displays initial contract state
- Logs all deployment information
- Provides verification instructions

## NPM Scripts Reference

Add these scripts to your package.json:

```json
{
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "test:sepolia": "hardhat test --network sepolia",
    "deploy": "hardhat run scripts/deploy.ts --network sepolia",
    "deploy:local": "hardhat run scripts/deploy.ts --network hardhat",
    "create-example": "ts-node scripts/create-example.ts",
    "generate-docs": "ts-node scripts/generate-docs.ts",
    "typechain": "hardhat typechain",
    "coverage": "hardhat coverage"
  }
}
```

## Hardhat Tasks

In addition to these scripts, custom Hardhat tasks are available in the `tasks/` directory:

```bash
# Get contract info
npx hardhat copyright:info

# Register as author
npx hardhat copyright:register-author --author-id 123456

# Register a work
npx hardhat copyright:register-work --hash 42 --title "My Work" --category "Art"

# Get author statistics
npx hardhat copyright:get-stats --address 0x1234...

# Get work information
npx hardhat copyright:get-work --id 1

# File a dispute
npx hardhat copyright:file-dispute --work-id 1 --hash 42
```

## Development Workflow

### Creating a New Example Repository

1. **Generate the repository:**
   ```bash
   npm run create-example ./output/copyright-example
   ```

2. **Navigate and setup:**
   ```bash
   cd ./output/copyright-example
   npm install
   ```

3. **Configure environment:**
   ```bash
   # Edit .env with your configuration
   nano .env
   ```

4. **Test the example:**
   ```bash
   npm run compile
   npm run test
   ```

5. **Deploy:**
   ```bash
   npm run deploy:local  # or npm run deploy for Sepolia
   ```

### Generating Documentation

1. **Generate docs:**
   ```bash
   npm run generate-docs
   ```

2. **Review output:**
   ```bash
   cat docs/copyright-protection.md
   cat docs/SUMMARY.md
   ```

3. **Integrate with GitBook:**
   - Copy docs/ to GitBook project
   - Update main SUMMARY.md if needed
   - Build and preview

## Troubleshooting

### Script Execution Errors

**Problem:** `ts-node: command not found`
```bash
# Solution: Install ts-node globally or use npx
npm install -g ts-node
# OR
npx ts-node scripts/create-example.ts
```

**Problem:** `Cannot find module`
```bash
# Solution: Install dependencies
npm install
```

**Problem:** `Permission denied`
```bash
# Solution: Make script executable
chmod +x scripts/create-example.ts
```

### Directory Already Exists

**Problem:** Output directory already exists
```bash
# Solution: Use a different directory or remove existing one
rm -rf ./output/existing-directory
npm run create-example ./output/new-directory
```

### Documentation Generation

**Problem:** Contract or test file not found
```bash
# Solution: Ensure files exist at expected paths
ls contracts/AnonymousCopyright.sol
ls test/AnonymousCopyright.ts
```

## Best Practices

1. **Version Control:** Always commit before generating examples
2. **Testing:** Test generated examples before distribution
3. **Documentation:** Keep docs in sync with code changes
4. **Naming:** Use descriptive names for output directories
5. **Cleanup:** Remove test outputs after verification

## Script Customization

### Modifying create-example.ts

To customize the generated example:
1. Edit the `packageJson` object to change dependencies
2. Modify the README template
3. Add additional files to the `filesToCopy` array
4. Update deployment script template

### Modifying generate-docs.ts

To customize documentation generation:
1. Edit `DOCS_CONFIG` for metadata
2. Modify markdown sections in `generateDocumentation()`
3. Update `generateSummary()` for navigation
4. Add new sections as needed

## Examples

### Generate Multiple Examples

```bash
# Create basic example
npm run create-example ./examples/basic

# Create advanced example with custom setup
npx ts-node scripts/create-example.ts ./examples/advanced

# Generate docs for all
npm run generate-docs
```

### Batch Operations

```bash
#!/bin/bash
# Generate multiple examples
for name in example1 example2 example3; do
  npm run create-example ./output/$name
done
```

## Resources

- [Hardhat Documentation](https://hardhat.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [GitBook Documentation](https://docs.gitbook.com/)
- [FHEVM Documentation](https://docs.zama.ai/fhevm/)

## License

These scripts are part of the Anonymous Copyright Protection project and are licensed under the MIT License.

---

For questions or issues with these scripts, please check the main project documentation or create an issue on GitHub.
