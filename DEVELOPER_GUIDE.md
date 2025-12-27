# Developer Guide - Anonymous Copyright Protection

## For Maintainers and Contributors

This guide provides detailed information for developers who want to maintain, extend, or contribute to the Anonymous Copyright Protection project.

---

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Adding New Features](#adding-new-features)
3. [Updating Dependencies](#updating-dependencies)
4. [Extending Automation Tools](#extending-automation-tools)
5. [Documentation Maintenance](#documentation-maintenance)
6. [Testing Guidelines](#testing-guidelines)
7. [Deployment Procedures](#deployment-procedures)
8. [Troubleshooting](#troubleshooting)

---

## Project Architecture

### Directory Structure

```
AnonymousCopyright/
├── contracts/              # Smart contracts
│   └── AnonymousCopyright.sol
├── test/                   # Test suites
│   └── AnonymousCopyright.ts
├── scripts/                # Automation scripts
│   ├── create-example.ts   # Repository generator
│   ├── generate-docs.ts    # Documentation generator
│   ├── deploy.ts           # Deployment script
│   └── README.md           # Scripts documentation
├── deploy/                 # Hardhat-deploy scripts
│   └── 001_deploy_copyright.ts
├── tasks/                  # Hardhat custom tasks
│   └── copyright.ts
├── base-template/          # Reusable Hardhat template
│   ├── contracts/
│   ├── test/
│   ├── deploy/
│   └── [configuration files]
├── docs/                   # Generated documentation
├── hardhat.config.ts       # Hardhat configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── [documentation files]
```

### Tech Stack Overview

**Smart Contracts:**
- Solidity 0.8.24
- @fhevm/solidity for FHE operations
- SepoliaConfig for network configuration

**Development:**
- TypeScript 5.0+ for all scripts
- Hardhat 2.19.0 as development framework
- TypeChain for type-safe contract interactions

**Testing:**
- Chai for assertions
- Mocha as test runner
- @fhevm/hardhat-plugin for FHE testing

---

## Adding New Features

### 1. Adding a New Contract Function

#### Step 1: Update the Contract

Edit `contracts/AnonymousCopyright.sol`:

```solidity
/**
 * @notice Your new function description
 * @param param1 Description of param1
 * @return Description of return value
 */
function newFunction(uint256 param1) external returns (bool) {
    // Implementation
    emit NewEvent(param1);
    return true;
}
```

**Best Practices:**
- Add comprehensive JSDoc comments
- Use encrypted types (euint32, euint64) for sensitive data
- Call `FHE.allowThis()` and `FHE.allow()` for encrypted values
- Emit events for state changes
- Add access control if needed

#### Step 2: Add Tests

Edit `test/AnonymousCopyright.ts`:

```typescript
describe("New Function", function () {
  it("should work correctly", async function () {
    // Arrange
    const param1 = 42;

    // Act
    const tx = await contract.newFunction(param1);
    await tx.wait();

    // Assert
    expect(tx).to.emit(contract, "NewEvent");
  });

  it("should revert on invalid input", async function () {
    await expect(contract.newFunction(0)).to.be.revertedWith("Invalid input");
  });
});
```

**Testing Checklist:**
- [ ] Success cases
- [ ] Failure cases with proper error messages
- [ ] Edge cases (zero values, max values, etc.)
- [ ] Event emissions
- [ ] State transitions
- [ ] Permission checks

#### Step 3: Add Hardhat Task (Optional)

Edit `tasks/copyright.ts`:

```typescript
task("copyright:new-function", "Execute new function")
  .addParam("param1", "Parameter description")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers, deployments } = hre;
    const deployment = await deployments.get("AnonymousCopyright");
    const contract = await ethers.getContractAt("AnonymousCopyright", deployment.address);

    const tx = await contract.newFunction(taskArgs.param1);
    await tx.wait();
    console.log("✅ Function executed successfully");
  });
```

#### Step 4: Update Documentation

1. Add function to `GUIDE.md` under "Contract Functions"
2. Add example to `EXAMPLES.md`
3. Regenerate docs: `npm run generate-docs`

#### Step 5: Compile and Test

```bash
npm run compile
npm run test
npm run coverage  # Ensure new function is covered
```

### 2. Adding Encryption Features

When adding FHE-encrypted functionality:

```solidity
// Import FHE types
import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";

function encryptedOperation(euint32 encryptedInput, bytes calldata inputProof) external {
    // Convert external encrypted input
    euint32 value = FHE.asEuint32(encryptedInput);

    // Perform FHE operations
    euint32 result = FHE.add(value, storedEncryptedValue);

    // CRITICAL: Grant permissions
    FHE.allowThis(result);           // Contract can read
    FHE.allow(result, msg.sender);   // Sender can decrypt

    // Store result
    storedEncryptedValue = result;
}
```

**FHE Best Practices:**
- Always use `FHE.asEuint*()` to convert inputs
- Call both `allowThis()` and `allow()` for encrypted values
- Use appropriate encrypted types (euint8, euint16, euint32, euint64)
- Remember: Comparison operations return `ebool`
- Test in mock environment before Sepolia deployment

---

## Updating Dependencies

### Routine Updates

#### 1. Check for Updates

```bash
# Check for outdated packages
npm outdated

# Check for security vulnerabilities
npm audit
```

#### 2. Update FHEVM Libraries

When @fhevm/solidity releases a new version:

```bash
# Update package.json
npm install @fhevm/solidity@latest @fhevm/hardhat-plugin@latest

# Recompile
npm run compile

# Run all tests
npm run test
```

**Important Checks:**
- [ ] All tests pass
- [ ] No breaking changes in FHE API
- [ ] Network configurations still valid
- [ ] Encryption/decryption still works

#### 3. Update Hardhat

```bash
npm install hardhat@latest

# Update Hardhat plugins
npm install @nomicfoundation/hardhat-ethers@latest
npm install @nomicfoundation/hardhat-chai-matchers@latest
```

**Verification:**
- [ ] `npm run compile` works
- [ ] `npm run test` passes
- [ ] Deployment scripts work
- [ ] Tasks still function

#### 4. Update TypeScript

```bash
npm install typescript@latest ts-node@latest
npm install @types/node@latest @types/mocha@latest @types/chai@latest
```

**Check:**
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Scripts still run
- [ ] Type generation works

### Breaking Changes

If updates introduce breaking changes:

1. **Document the changes** in CHANGELOG.md
2. **Update contract code** if FHE API changed
3. **Update tests** for new syntax/APIs
4. **Update scripts** if Hardhat API changed
5. **Update documentation** with new examples
6. **Regenerate docs**: `npm run generate-docs`

---

## Extending Automation Tools

### Modifying create-example.ts

The repository generator can be extended to support more features:

#### Add New Files to Template

In `scripts/create-example.ts`, find the `filesToCopy` array:

```typescript
const filesToCopy = [
  { src: 'hardhat.config.ts', dest: 'hardhat.config.ts' },
  { src: 'tsconfig.json', dest: 'tsconfig.json' },
  // Add your new file here
  { src: 'newfile', dest: 'newfile' },
];
```

#### Customize Generated README

Find the `readme` template string and modify:

```typescript
const readme = `# Your Custom Title

## Custom Content

- Custom section 1
- Custom section 2

...existing content...
`;
```

#### Add Pre/Post-Generation Hooks

```typescript
// Before generation
info('Running pre-generation hooks...');
// Your custom logic here

// After generation
info('Running post-generation hooks...');
execSync(`cd ${absoluteOutputDir} && npm install`, { stdio: 'inherit' });
```

### Modifying generate-docs.ts

#### Add New Documentation Sections

In `generateDocumentation()` function:

```typescript
// Add after existing sections
markdown += `## Your New Section\n\n`;
markdown += `Content for your new section...\n\n`;
```

#### Customize Code Extraction

```typescript
function extractCustomInfo(code: string): string[] {
  const regex = /your-custom-pattern/g;
  // Custom extraction logic
  return matches;
}
```

---

## Documentation Maintenance

### Keeping Docs in Sync

#### 1. Inline Documentation

Always update JSDoc comments when modifying contracts:

```solidity
/**
 * @notice Clear, concise description
 * @dev Technical implementation details
 * @param paramName Parameter description
 * @return Description of return value
 */
function myFunction(uint256 paramName) external returns (bool) {
    // Implementation
}
```

#### 2. Test Documentation

Add descriptive comments to tests:

```typescript
/**
 * Test: Ensure function reverts with proper error message
 * When: Invalid input is provided
 * Then: Transaction should revert with "Invalid input"
 */
it("should revert on invalid input", async function () {
  // Test implementation
});
```

#### 3. Regenerate Documentation

After any code changes:

```bash
npm run generate-docs
```

This updates:
- `docs/copyright-protection.md`
- `docs/SUMMARY.md`

#### 4. Update Manual Docs

Manually update these files when needed:
- `README.md` - Project overview
- `GUIDE.md` - Development guide
- `EXAMPLES.md` - Usage examples

### Documentation Style Guide

**Markdown:**
- Use clear headings (##, ###)
- Include code examples with syntax highlighting
- Use bullet points for lists
- Add inline code with backticks

**Code Examples:**
- Show complete, working examples
- Include imports and setup
- Add comments explaining key steps
- Show both success and error cases

---

## Testing Guidelines

### Test Structure

```typescript
describe("Feature Name", function () {
  // Setup
  let contract: Contract;
  let signers: Signers;

  before(async function () {
    // One-time setup
  });

  beforeEach(async function () {
    // Per-test setup
    ({ contract, contractAddress } = await deployFixture());
  });

  describe("Specific Function", function () {
    it("should handle success case", async function () {
      // Test implementation
    });

    it("should revert on error", async function () {
      // Test implementation
    });
  });
});
```

### Writing Effective Tests

#### 1. Arrange-Act-Assert Pattern

```typescript
it("should do something", async function () {
  // Arrange: Set up test data
  const input = 42;
  const expected = 84;

  // Act: Execute the operation
  const result = await contract.someFunction(input);

  // Assert: Verify the result
  expect(result).to.equal(expected);
});
```

#### 2. Test Edge Cases

```typescript
it("should handle maximum value", async function () {
  const maxUint32 = (2n ** 32n) - 1n;
  await contract.setvalue(maxUint32);
});

it("should handle zero value", async function () {
  await contract.setValue(0n);
});
```

#### 3. Test Error Conditions

```typescript
it("should revert with proper message", async function () {
  await expect(
    contract.invalidOperation()
  ).to.be.revertedWith("Expected error message");
});
```

### Running Tests

```bash
# All tests
npm run test

# Specific test file
npx hardhat test test/AnonymousCopyright.ts

# With gas reporting
REPORT_GAS=true npm run test

# With coverage
npm run coverage
```

---

## Deployment Procedures

### Local Deployment

```bash
# Start local node (Terminal 1)
npm run node

# Deploy (Terminal 2)
npm run deploy:local
```

### Sepolia Deployment

#### 1. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

#### 2. Get Testnet ETH

Get Sepolia ETH from faucets:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

#### 3. Deploy

```bash
npm run deploy
```

#### 4. Verify on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Sufficient testnet ETH in deployer account
- [ ] Contracts compiled: `npm run compile`
- [ ] Tests passing: `npm run test`
- [ ] Deployment successful
- [ ] Contract verified on Etherscan
- [ ] Initial tests on deployed contract
- [ ] Document contract address

---

## Troubleshooting

### Common Issues

#### Contract Won't Compile

```bash
# Clear cache and recompile
npx hardhat clean
npm run compile
```

#### Tests Failing

```bash
# Check if running in mock mode
# Tests only work with fhevm.isMock === true

# Clear and rebuild
npx hardhat clean
npm run compile
npm run test
```

#### TypeChain Types Not Generated

```bash
npm run typechain
```

#### Deployment Fails

**Check:**
- Sufficient gas/ETH in deployer account
- Network RPC URL is correct
- Private key is correct (0x prefix)
- Network is accessible

#### FHE Operations Failing

**Common causes:**
- Forgot `FHE.allowThis()`
- Forgot `FHE.allow(user)`
- Wrong encrypted type (euint32 vs euint64)
- Missing input proof
- Signer mismatch in encryption

---

## Best Practices

### Code Quality

1. **Use TypeScript** for all new scripts
2. **Enable strict mode** in tsconfig.json
3. **Add comprehensive comments** to complex logic
4. **Follow naming conventions**:
   - `camelCase` for variables and functions
   - `PascalCase` for contracts and types
   - `UPPER_CASE` for constants

### Security

1. **Validate all inputs** in smart contracts
2. **Use access control** (onlyOwner, etc.)
3. **Emit events** for all state changes
4. **Never commit private keys** or `.env` files
5. **Test thoroughly** before deployment

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature: description"

# Push and create PR
git push origin feature/new-feature
```

### Documentation

1. **Update docs** with code changes
2. **Add examples** for new features
3. **Regenerate GitBook docs** after updates
4. **Keep README concise**, details in GUIDE

---

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm/)
- [Hardhat Documentation](https://hardhat.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Chai Assertion Library](https://www.chaijs.com/)

---

## Contributing

When contributing:

1. Read this guide thoroughly
2. Follow the coding standards
3. Write comprehensive tests
4. Update documentation
5. Test locally before submitting
6. Create clear commit messages
7. Submit PR with description

---

## License

This project is licensed under the MIT License.

---

For questions or support, please create an issue on GitHub or refer to the main project documentation.
