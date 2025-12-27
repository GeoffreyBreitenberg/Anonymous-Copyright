# Usage Examples - Anonymous Copyright Protection

This document provides practical examples of using the Anonymous Copyright Protection smart contract system.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Author Registration](#author-registration)
3. [Registering Works](#registering-works)
4. [Verifying Ownership](#verifying-ownership)
5. [Filing Disputes](#filing-disputes)
6. [Querying Information](#querying-information)
7. [Advanced Use Cases](#advanced-use-cases)

## Basic Setup

### Import Contract Types

```typescript
import { ethers } from "hardhat";
import { AnonymousCopyright } from "../types";

// Get contract instance
const contractAddress = "0x...";
const contract = await ethers.getContractAt("AnonymousCopyright", contractAddress);
```

### Get Signers

```typescript
const [deployer, alice, bob] = await ethers.getSigners();
```

## Author Registration

### Register as Anonymous Author

```typescript
// Alice registers with encrypted author ID
const authorId = 123456n;
const tx = await contract.connect(alice).registerAuthor(authorId);
await tx.wait();

console.log("Author registered successfully!");
```

### Check Registration Status

```typescript
const isRegistered = await contract.isRegisteredAuthor(alice.address);
console.log("Is registered:", isRegistered); // true
```

### View Author Statistics

```typescript
const stats = await contract.getAuthorStats(alice.address);
console.log("Registered:", stats.registered);
console.log("Works count:", stats.workCount.toString());
console.log("Total disputes:", stats.totalDisputes.toString());
console.log("Won disputes:", stats.wonDisputes.toString());
```

## Registering Works

### Register a Literary Work

```typescript
const contentHash = 42n; // Hash of your content
const title = "The Mysterious Algorithm";
const category = "Literature";

const tx = await contract.connect(alice).registerWork(contentHash, title, category);
const receipt = await tx.wait();

// Extract work ID from event
const event = receipt.logs.find((log) => log.eventName === "WorkRegistered");
const workId = event.args.workId;

console.log("Work registered with ID:", workId.toString());
```

### Register Multiple Works

```typescript
const works = [
  { hash: 100n, title: "Sunrise Symphony", category: "Music" },
  { hash: 200n, title: "Abstract Dreams", category: "Art" },
  { hash: 300n, title: "Mountain Landscape", category: "Photography" },
];

for (const work of works) {
  await contract.connect(alice).registerWork(work.hash, work.title, work.category);
}

const authorWorks = await contract.getAuthorWorks(alice.address);
console.log("Total works registered:", authorWorks.length);
```

### Register Software/Code

```typescript
// Hash your source code (off-chain)
const sourceCode = "function hello() { return 'world'; }";
const hashValue = computeHash(sourceCode); // Your hashing function

const tx = await contract.connect(alice).registerWork(
  hashValue,
  "Hello World Library v1.0",
  "Software"
);
await tx.wait();
```

## Verifying Ownership

### Verify Work Information

```typescript
const workId = 1;
const workInfo = await contract.getWorkInfo(workId);

console.log("Registrant:", workInfo.registrant);
console.log("Title:", workInfo.title);
console.log("Category:", workInfo.category);
console.log("Timestamp:", new Date(Number(workInfo.timestamp) * 1000));
console.log("Verified:", workInfo.verified);
console.log("Disputed:", workInfo.disputed);
```

### Owner Marks Work as Verified

```typescript
// Only contract owner can verify
const workId = 1;
const tx = await contract.connect(deployer).markWorkAsVerified(workId);
await tx.wait();

console.log("Work verified!");
```

## Filing Disputes

### Challenge a Work's Ownership

```typescript
// Bob believes he registered the work first
const workId = 1;
const bobsContentHash = 42n; // Same hash as the disputed work

const tx = await contract.connect(bob).fileDispute(workId, bobsContentHash);
await tx.wait();

console.log("Dispute filed successfully!");
```

### Check Dispute Information

```typescript
const workId = 1;
const disputeCount = await contract.getDisputeCount(workId);
console.log("Number of disputes:", disputeCount.toString());

// Get specific dispute details
for (let i = 0; i < disputeCount; i++) {
  const dispute = await contract.getDisputeInfo(workId, i);
  console.log(`\nDispute #${i}:`);
  console.log("  Challenger:", dispute.challenger);
  console.log("  Timestamp:", new Date(Number(dispute.timestamp) * 1000));
  console.log("  Resolved:", dispute.resolved);
  if (dispute.resolved) {
    console.log("  Winner:", dispute.winner);
  }
}
```

## Querying Information

### Get All Works by Author

```typescript
const workIds = await contract.getAuthorWorks(alice.address);
console.log(`\nAlice has ${workIds.length} registered works:`);

for (const workId of workIds) {
  const info = await contract.getWorkInfo(workId);
  console.log(`- Work #${workId}: "${info.title}" (${info.category})`);
}
```

### Get Total Platform Statistics

```typescript
const totalWorks = await contract.getTotalWorks();
console.log("Total works on platform:", totalWorks.toString());
```

### Monitor Events

```typescript
// Listen for new work registrations
contract.on("WorkRegistered", (workId, registrant, title, timestamp) => {
  console.log(`New work registered!`);
  console.log(`  ID: ${workId}`);
  console.log(`  Title: ${title}`);
  console.log(`  By: ${registrant}`);
  console.log(`  At: ${new Date(Number(timestamp) * 1000)}`);
});

// Listen for disputes
contract.on("DisputeFiled", (workId, challenger, disputeId) => {
  console.log(`Dispute filed for work #${workId}`);
  console.log(`  By: ${challenger}`);
  console.log(`  Dispute ID: ${disputeId}`);
});
```

## Advanced Use Cases

### Anonymous Author Publishing Platform

```typescript
/**
 * Example: A platform where whistleblowers can register documents
 * without revealing their identity, with encrypted timestamps.
 */
async function registerAnonymousDocument(
  contract: AnonymousCopyright,
  signer: SignerWithAddress,
  documentHash: bigint,
  title: string
) {
  // Generate random author ID for anonymity
  const randomAuthorId = BigInt(Math.floor(Math.random() * 1000000000));

  // Check if already registered
  const isRegistered = await contract.isRegisteredAuthor(signer.address);

  if (!isRegistered) {
    await contract.connect(signer).registerAuthor(randomAuthorId);
  }

  // Register document
  const tx = await contract.connect(signer).registerWork(
    documentHash,
    title,
    "Whistleblower Document"
  );

  const receipt = await tx.wait();
  return receipt;
}
```

### Batch Copyright Protection for Artists

```typescript
/**
 * Example: An artist registering their entire portfolio
 */
async function registerArtPortfolio(
  contract: AnonymousCopyright,
  artist: SignerWithAddress,
  artworks: Array<{ hash: bigint; title: string; medium: string }>
) {
  // Register artist once
  const artistId = 987654n;
  await contract.connect(artist).registerAuthor(artistId);

  // Register all artworks
  const workIds: bigint[] = [];

  for (const artwork of artworks) {
    const tx = await contract.connect(artist).registerWork(
      artwork.hash,
      artwork.title,
      `Art - ${artwork.medium}`
    );
    const receipt = await tx.wait();

    // Extract work ID from event
    const event = receipt.logs.find((log) => log.eventName === "WorkRegistered");
    if (event) {
      workIds.push(event.args.workId);
    }
  }

  return workIds;
}

// Usage
const portfolio = [
  { hash: 1001n, title: "Sunset Over Mountains", medium: "Oil Painting" },
  { hash: 1002n, title: "Urban Reflections", medium: "Photography" },
  { hash: 1003n, title: "Digital Dreams", medium: "Digital Art" },
];

const registeredIds = await registerArtPortfolio(contract, alice, portfolio);
console.log("Registered work IDs:", registeredIds);
```

### Research Paper Priority Claims

```typescript
/**
 * Example: Researchers establishing priority for discoveries
 */
async function registerResearchPaper(
  contract: AnonymousCopyright,
  researcher: SignerWithAddress,
  paperHash: bigint,
  paperTitle: string,
  researcherId: bigint
) {
  // Register as researcher
  const isRegistered = await contract.isRegisteredAuthor(researcher.address);
  if (!isRegistered) {
    await contract.connect(researcher).registerAuthor(researcherId);
  }

  // Register research paper
  const tx = await contract.connect(researcher).registerWork(
    paperHash,
    paperTitle,
    "Academic Research"
  );

  const receipt = await tx.wait();

  console.log(`Research paper "${paperTitle}" registered`);
  console.log(`Blockchain timestamp provides proof of prior art`);

  return receipt;
}
```

### Multi-Author Collaboration

```typescript
/**
 * Example: Multiple authors collaborating on a project
 * Each registers their contribution separately
 */
async function registerCollaborativeWork(
  contract: AnonymousCopyright,
  collaborators: SignerWithAddress[],
  workHash: bigint,
  projectTitle: string
) {
  const workIds: bigint[] = [];

  for (let i = 0; i < collaborators.length; i++) {
    const collaborator = collaborators[i];
    const authorId = BigInt(100000 + i);

    // Register author
    const isRegistered = await contract.isRegisteredAuthor(collaborator.address);
    if (!isRegistered) {
      await contract.connect(collaborator).registerAuthor(authorId);
    }

    // Each registers their contribution
    const individualTitle = `${projectTitle} - Contributor ${i + 1}`;
    const tx = await contract.connect(collaborator).registerWork(
      workHash,
      individualTitle,
      "Collaborative Project"
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find((log) => log.eventName === "WorkRegistered");
    if (event) {
      workIds.push(event.args.workId);
    }
  }

  return workIds;
}
```

### Content Hash Generation

```typescript
/**
 * Off-chain helper to generate content hashes
 * (This would typically be done in frontend or separate script)
 */
function generateContentHash(content: string): number {
  // Simple example - in production use cryptographic hash
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 4294967296; // Keep within uint32 range
}

// Usage
const myNovel = "Once upon a time in a land of encryption...";
const contentHash = generateContentHash(myNovel);
await contract.connect(alice).registerWork(
  BigInt(contentHash),
  "My Encrypted Novel",
  "Literature"
);
```

## Error Handling

### Handling Common Errors

```typescript
try {
  await contract.connect(alice).registerWork(42n, "My Work", "Art");
} catch (error: any) {
  if (error.message.includes("Author not registered")) {
    console.log("Please register as an author first!");
    await contract.connect(alice).registerAuthor(123456n);
    // Retry
    await contract.connect(alice).registerWork(42n, "My Work", "Art");
  } else if (error.message.includes("Title required")) {
    console.log("Please provide a title for your work");
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## Integration with Frontend

### React Example

```typescript
import { ethers } from "ethers";
import AnonymousCopyrightABI from "./AnonymousCopyright.json";

async function connectAndRegisterWork() {
  // Connect to MetaMask
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  // Get contract
  const contractAddress = "0x...";
  const contract = new ethers.Contract(
    contractAddress,
    AnonymousCopyrightABI,
    signer
  );

  // Register work
  const tx = await contract.registerWork(
    42n,
    "My Frontend Work",
    "Digital Art"
  );

  await tx.wait();
  alert("Work registered successfully!");
}
```

## Best Practices

1. **Always register as author first** before attempting to register works
2. **Generate strong content hashes** using cryptographic functions
3. **Store original content securely** off-chain
4. **Use meaningful titles** while preserving privacy
5. **Monitor events** for real-time updates
6. **Handle errors gracefully** with try-catch blocks
7. **Test thoroughly** in development environment before production

## Testing Examples

See `test/AnonymousCopyright.ts` for comprehensive test examples covering all contract functions and edge cases.

---

For more information, see [GUIDE.md](./GUIDE.md) for development documentation.
