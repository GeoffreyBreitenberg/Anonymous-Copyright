#!/usr/bin/env ts-node

/**
 * generate-docs - Generates GitBook-formatted documentation from contracts and tests
 *
 * This script extracts code from smart contracts and test files to create
 * comprehensive GitBook-compatible documentation.
 *
 * Usage:
 *   npx ts-node scripts/generate-docs.ts
 *   npm run generate-docs
 */

import * as fs from 'fs';
import * as path from 'path';

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

function success(message: string): void {
  log(`✅ ${message}`, Color.Green);
}

function info(message: string): void {
  log(`ℹ️  ${message}`, Color.Blue);
}

function error(message: string): never {
  log(`❌ Error: ${message}`, Color.Red);
  process.exit(1);
}

function section(title: string): void {
  log(`\n${'='.repeat(60)}`, Color.Cyan);
  log(`  ${title}`, Color.Cyan);
  log(`${'='.repeat(60)}\n`, Color.Cyan);
}

interface DocumentConfig {
  title: string;
  description: string;
  contractPath: string;
  testPath: string;
  category: string;
  chapter: string;
}

const projectRoot = path.resolve(__dirname, '..');

// Documentation configurations
const DOCS_CONFIG: DocumentConfig = {
  title: 'Anonymous Copyright Protection',
  description:
    'Privacy-preserving smart contracts for copyright protection using Fully Homomorphic Encryption',
  contractPath: 'contracts/AnonymousCopyright.sol',
  testPath: 'test/AnonymousCopyright.ts',
  category: 'Privacy & Copyright',
  chapter: 'copyright-protection',
};

/**
 * Read file content safely
 */
function readFile(filePath: string): string {
  const fullPath = path.join(projectRoot, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Create docs directory if it doesn't exist
 */
function ensureDocsDir(): string {
  const docsDir = path.join(projectRoot, 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  return docsDir;
}

/**
 * Extract JSDoc comments from code
 */
function extractJSDocComments(code: string): string[] {
  const comments: string[] = [];
  const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  let match;

  while ((match = jsdocRegex.exec(code)) !== null) {
    comments.push(match[0]);
  }

  return comments;
}

/**
 * Extract function definitions from Solidity code
 */
function extractFunctionSignatures(code: string): string[] {
  const functions: string[] = [];
  const functionRegex = /^\s*(public|external|internal|private)?\s*(view|pure)?\s*function\s+\w+\([^)]*\)[^{]*\{/gm;
  let match;

  while ((match = functionRegex.exec(code)) !== null) {
    functions.push(match[0].trim());
  }

  return functions;
}

/**
 * Generate documentation markdown
 */
function generateDocumentation(config: DocumentConfig): string {
  let markdown = '';

  // Header
  markdown += `# ${config.title}\n\n`;
  markdown += `**Category:** ${config.category}\n\n`;
  markdown += `${config.description}\n\n`;

  // Table of Contents
  markdown += `## Table of Contents\n\n`;
  markdown += `1. [Overview](#overview)\n`;
  markdown += `2. [Smart Contract](#smart-contract)\n`;
  markdown += `3. [Test Suite](#test-suite)\n`;
  markdown += `4. [Key Functions](#key-functions)\n`;
  markdown += `5. [Usage Examples](#usage-examples)\n\n`;

  // Overview Section
  markdown += `## Overview\n\n`;
  markdown += `The Anonymous Copyright Protection smart contract enables privacy-preserving registration and verification of creative works using Fully Homomorphic Encryption (FHE). Authors can register their works with encrypted identities and content hashes while maintaining verifiable ownership.\n\n`;

  markdown += `### Privacy Features\n\n`;
  markdown += `- **Encrypted Author Identity**: \`euint64\` stored on-chain\n`;
  markdown += `- **Encrypted Content Hash**: \`euint32\` for work fingerprints\n`;
  markdown += `- **FHE Verification**: Equality comparisons without decryption\n`;
  markdown += `- **Dispute Resolution**: Encrypted evidence handling\n\n`;

  // Smart Contract Section
  markdown += `## Smart Contract\n\n`;
  markdown += `### Source Code\n\n`;

  try {
    const contractCode = readFile(config.contractPath);
    markdown += '{% code title="' + path.basename(config.contractPath) + '" %}\n';
    markdown += '```solidity\n';
    markdown += contractCode;
    markdown += '\n```\n';
    markdown += '{% endcode %}\n\n';
  } catch (err) {
    markdown += `Error reading contract: ${err instanceof Error ? err.message : String(err)}\n\n`;
  }

  // Test Suite Section
  markdown += `## Test Suite\n\n`;
  markdown += `### Test File\n\n`;

  try {
    const testCode = readFile(config.testPath);
    // Show first 100 lines of test file
    const testLines = testCode.split('\n').slice(0, 100).join('\n');
    markdown += '{% code title="' + path.basename(config.testPath) + '" %}\n';
    markdown += '```typescript\n';
    markdown += testLines;
    markdown += '\n// ... (complete test file in test/ directory)\n';
    markdown += '```\n';
    markdown += '{% endcode %}\n\n';
  } catch (err) {
    markdown += `Error reading test file: ${err instanceof Error ? err.message : String(err)}\n\n`;
  }

  // Key Functions Section
  markdown += `## Key Functions\n\n`;

  markdown += `### Author Management\n\n`;
  markdown += `#### registerAuthor(uint64 _authorId)\n`;
  markdown += `- **Purpose**: Register as anonymous author with encrypted identity\n`;
  markdown += `- **Parameters**: \n`;
  markdown += `  - \`_authorId\`: Numeric author identifier (will be encrypted)\n`;
  markdown += `- **Events**: \`AuthorRegistered(address indexed author, uint256 timestamp)\`\n`;
  markdown += `- **Access**: Anyone (once per address)\n\n`;

  markdown += `#### getAuthorStats(address _author)\n`;
  markdown += `- **Purpose**: Retrieve author profile and statistics\n`;
  markdown += `- **Returns**:\n`;
  markdown += `  - \`registered\`: Registration status\n`;
  markdown += `  - \`workCount\`: Number of registered works\n`;
  markdown += `  - \`totalDisputes\`: Total disputes filed and received\n`;
  markdown += `  - \`wonDisputes\`: Number of disputes won\n`;
  markdown += `- **Access**: Public (view function)\n\n`;

  markdown += `### Work Management\n\n`;
  markdown += `#### registerWork(uint32 _contentHash, string _title, string _category)\n`;
  markdown += `- **Purpose**: Register a creative work with encrypted content hash\n`;
  markdown += `- **Parameters**:\n`;
  markdown += `  - \`_contentHash\`: Encrypted hash of work content\n`;
  markdown += `  - \`_title\`: Human-readable work title\n`;
  markdown += `  - \`_category\`: Work classification (Literature, Music, Art, etc.)\n`;
  markdown += `- **Returns**: Unique work ID\n`;
  markdown += `- **Events**: \`WorkRegistered(uint256 indexed workId, address indexed registrant, string title, uint256 timestamp)\`\n`;
  markdown += `- **Access**: Registered authors only\n\n`;

  markdown += `#### getWorkInfo(uint256 _workId)\n`;
  markdown += `- **Purpose**: Retrieve non-sensitive work information\n`;
  markdown += `- **Returns**: Registrant, timestamp, verification status, dispute count, title, category\n`;
  markdown += `- **Access**: Public (view function)\n\n`;

  markdown += `### Dispute Management\n\n`;
  markdown += `#### fileDispute(uint256 _workId, uint32 _challengerContentHash)\n`;
  markdown += `- **Purpose**: File a dispute claiming prior ownership\n`;
  markdown += `- **Parameters**:\n`;
  markdown += `  - \`_workId\`: ID of disputed work\n`;
  markdown += `  - \`_challengerContentHash\`: Encrypted hash of challenger's version\n`;
  markdown += `- **Events**: \`DisputeFiled(uint256 indexed workId, address indexed challenger, uint256 disputeId)\`\n`;
  markdown += `- **Access**: Registered authors (excluding original registrant)\n\n`;

  markdown += `#### resolveDispute(uint256 _workId, uint256 _disputeId)\n`;
  markdown += `- **Purpose**: Compare encrypted hashes to resolve dispute\n`;
  markdown += `- **Parameters**: Work ID and dispute ID to resolve\n`;
  markdown += `- **Events**: \`DisputeResolved(uint256 indexed workId, uint256 disputeId, address winner)\`\n`;
  markdown += `- **Access**: Owner only (requires FHE decryption)\n\n`;

  // Usage Examples Section
  markdown += `## Usage Examples\n\n`;

  markdown += `### Example 1: Register as Author\n\n`;
  markdown += `\`\`\`typescript\n`;
  markdown += `const authorId = 123456n;\n`;
  markdown += `const tx = await contract.connect(signer).registerAuthor(authorId);\n`;
  markdown += `await tx.wait();\n`;
  markdown += `console.log("Author registered with encrypted identity");\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### Example 2: Register a Work\n\n`;
  markdown += `\`\`\`typescript\n`;
  markdown += `const contentHash = 42n; // Encrypted hash of work content\n`;
  markdown += `const title = "My Copyrighted Novel";\n`;
  markdown += `const category = "Literature";\n\n`;
  markdown += `const tx = await contract.connect(signer).registerWork(\n`;
  markdown += `  contentHash,\n`;
  markdown += `  title,\n`;
  markdown += `  category\n`;
  markdown += `);\n`;
  markdown += `const receipt = await tx.wait();\n`;
  markdown += `console.log("Work registered successfully");\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### Example 3: Verify Work Ownership\n\n`;
  markdown += `\`\`\`typescript\n`;
  markdown += `const workId = 1;\n`;
  markdown += `const contentHashToVerify = 42n;\n\n`;
  markdown += `// Request FHE-based verification\n`;
  markdown += `const tx = await contract.requestVerifyWork(workId, contentHashToVerify);\n`;
  markdown += `await tx.wait();\n`;
  markdown += `console.log("Verification requested (async result via event)");\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### Example 4: File a Dispute\n\n`;
  markdown += `\`\`\`typescript\n`;
  markdown += `const workId = 1;\n`;
  markdown += `const challengerHash = 42n; // Challenger's version hash\n\n`;
  markdown += `const tx = await contract.connect(challenger).fileDispute(workId, challengerHash);\n`;
  markdown += `await tx.wait();\n`;
  markdown += `console.log("Dispute filed for work #" + workId);\n`;
  markdown += `\`\`\`\n\n`;

  // Security Considerations
  markdown += `## Security Considerations\n\n`;
  markdown += `### Privacy Guarantees\n`;
  markdown += `- Author identities remain encrypted as \`euint64\` on-chain\n`;
  markdown += `- Content hashes encrypted as \`euint32\` prevent plain-text comparison\n`;
  markdown += `- Verification logic uses FHE equality operations\n`;
  markdown += `- Work titles and categories remain public for discoverability\n\n`;

  markdown += `### Access Control\n`;
  markdown += `- \`registerAuthor()\`: One registration per address\n`;
  markdown += `- \`registerWork()\`: Registered authors only\n`;
  markdown += `- \`fileDispute()\`: Can't dispute own work\n`;
  markdown += `- \`markWorkAsVerified()\`: Owner-only function\n\n`;

  markdown += `### Common Pitfalls\n`;
  markdown += `- ❌ Forgetting to call \`FHE.allowThis()\` before \`FHE.allow()\`\n`;
  markdown += `- ❌ Using plain-text hashes instead of encrypted values\n`;
  markdown += `- ❌ Not granting permissions to both contract and user\n`;
  markdown += `- ❌ Attempting to retrieve encrypted values directly\n\n`;

  markdown += `## Testing\n\n`;
  markdown += `Run the comprehensive test suite:\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npm run compile\n`;
  markdown += `npm run test\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `Test coverage includes:\n`;
  markdown += `- Author registration and permissions\n`;
  markdown += `- Work registration and validation\n`;
  markdown += `- Work verification mechanisms\n`;
  markdown += `- Dispute filing and resolution\n`;
  markdown += `- Edge cases and error conditions\n\n`;

  markdown += `## Deployment\n\n`;
  markdown += `### Local Hardhat Network\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `npm run deploy:local\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `### Ethereum Sepolia Testnet\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `# Configure .env with SEPOLIA_RPC_URL and PRIVATE_KEY\n`;
  markdown += `npm run deploy\n`;
  markdown += `\`\`\`\n\n`;

  markdown += `## Resources\n\n`;
  markdown += `- [FHEVM Documentation](https://docs.zama.ai/fhevm/)\n`;
  markdown += `- [Hardhat Documentation](https://hardhat.org/)\n`;
  markdown += `- [Solidity Documentation](https://docs.soliditylang.org/)\n`;
  markdown += `- [README.md](../README.md) - Project overview\n`;
  markdown += `- [GUIDE.md](../GUIDE.md) - Development guide\n\n`;

  markdown += `---\n\n`;
  markdown += `**Generated from Anonymous Copyright Protection Project**\n`;
  markdown += `Licensed under MIT License\n`;

  return markdown;
}

/**
 * Generate SUMMARY.md for GitBook navigation
 */
function generateSummary(): string {
  let summary = '';

  summary += `# Summary\n\n`;
  summary += `## Anonymous Copyright Protection\n\n`;
  summary += `* [Overview](../README.md)\n`;
  summary += `* [Development Guide](../GUIDE.md)\n`;
  summary += `* [Usage Examples](../EXAMPLES.md)\n\n`;
  summary += `### Documentation\n\n`;
  summary += `* [Smart Contract Guide](copyright-protection.md)\n`;
  summary += `  * [Functions](copyright-protection.md#key-functions)\n`;
  summary += `  * [Examples](copyright-protection.md#usage-examples)\n`;
  summary += `  * [Security](copyright-protection.md#security-considerations)\n\n`;
  summary += `### Reference\n\n`;
  summary += `* [License](../LICENSE)\n`;

  return summary;
}

/**
 * Main execution
 */
async function main() {
  section('Documentation Generator');

  try {
    const docsDir = ensureDocsDir();
    info(`Using docs directory: ${docsDir}`);

    // Generate main documentation
    info('Generating documentation...');
    const documentation = generateDocumentation(DOCS_CONFIG);
    const docPath = path.join(docsDir, `${DOCS_CONFIG.chapter}.md`);
    fs.writeFileSync(docPath, documentation);
    success(`Documentation created: ${path.relative(projectRoot, docPath)}`);

    // Generate SUMMARY.md
    info('Generating SUMMARY.md...');
    const summary = generateSummary();
    const summaryPath = path.join(docsDir, 'SUMMARY.md');
    fs.writeFileSync(summaryPath, summary);
    success(`Summary created: ${path.relative(projectRoot, summaryPath)}`);

    section('Documentation Complete!');

    log('📚 Generated files:\n');
    log(`   ${path.relative(projectRoot, docPath)}`);
    log(`   ${path.relative(projectRoot, summaryPath)}\n`);

    log('📖 GitBook Setup:\n', Color.Yellow);
    log('   1. Copy docs/ directory to your GitBook project');
    log('   2. Update SUMMARY.md as needed');
    log('   3. Run: gitbook build\n');

    success('Documentation generated successfully!');

  } catch (err) {
    error(`Documentation generation failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Run if executed directly
main().catch((err) => {
  error(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
});
