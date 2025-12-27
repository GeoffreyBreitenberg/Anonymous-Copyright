import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { AnonymousCopyright, AnonymousCopyright__factory } from "../types";
import { expect } from "chai";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("AnonymousCopyright")) as AnonymousCopyright__factory;
  const contract = (await factory.deploy()) as AnonymousCopyright;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("AnonymousCopyright", function () {
  let signers: Signers;
  let contract: AnonymousCopyright;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
    };
  });

  beforeEach(async function () {
    // Skip tests if not running in mock FHEVM environment
    if (!fhevm.isMock) {
      console.warn(`This test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  describe("Author Registration", function () {
    it("should register author successfully", async function () {
      const authorId = 123456n;
      const tx = await contract.connect(signers.alice).registerAuthor(authorId);
      await tx.wait();

      const isRegistered = await contract.isRegisteredAuthor(signers.alice.address);
      expect(isRegistered).to.be.true;
    });

    it("should emit AuthorRegistered event", async function () {
      const authorId = 789012n;
      await expect(contract.connect(signers.alice).registerAuthor(authorId)).to.emit(
        contract,
        "AuthorRegistered",
      );
    });

    it("should prevent double registration", async function () {
      const authorId = 345678n;
      await contract.connect(signers.alice).registerAuthor(authorId);

      await expect(contract.connect(signers.alice).registerAuthor(authorId)).to.be.revertedWith(
        "Already registered",
      );
    });

    it("should return author stats after registration", async function () {
      const authorId = 111222n;
      await contract.connect(signers.alice).registerAuthor(authorId);

      const stats = await contract.getAuthorStats(signers.alice.address);
      expect(stats.registered).to.be.true;
      expect(stats.workCount).to.equal(0);
      expect(stats.totalDisputes).to.equal(0);
      expect(stats.wonDisputes).to.equal(0);
    });
  });

  describe("Work Registration", function () {
    beforeEach(async function () {
      // Register authors before each test
      await contract.connect(signers.alice).registerAuthor(111111n);
      await contract.connect(signers.bob).registerAuthor(222222n);
    });

    it("should register work successfully", async function () {
      const contentHash = 42n;
      const title = "My Original Work";
      const category = "Literature";

      const tx = await contract.connect(signers.alice).registerWork(contentHash, title, category);
      const receipt = await tx.wait();

      expect(receipt).to.not.be.null;

      const totalWorks = await contract.getTotalWorks();
      expect(totalWorks).to.equal(1);
    });

    it("should emit WorkRegistered event", async function () {
      const contentHash = 99n;
      const title = "Test Work";
      const category = "Music";

      await expect(contract.connect(signers.alice).registerWork(contentHash, title, category)).to.emit(
        contract,
        "WorkRegistered",
      );
    });

    it("should prevent unregistered author from registering work", async function () {
      const contentHash = 55n;
      const title = "Unauthorized Work";
      const category = "Art";

      await expect(
        contract.connect(signers.charlie).registerWork(contentHash, title, category),
      ).to.be.revertedWith("Author not registered");
    });

    it("should require non-empty title", async function () {
      const contentHash = 33n;
      const title = "";
      const category = "Software";

      await expect(contract.connect(signers.alice).registerWork(contentHash, title, category)).to.be.revertedWith(
        "Title required",
      );
    });

    it("should require non-empty category", async function () {
      const contentHash = 44n;
      const title = "Valid Title";
      const category = "";

      await expect(contract.connect(signers.alice).registerWork(contentHash, title, category)).to.be.revertedWith(
        "Category required",
      );
    });

    it("should increment work counter", async function () {
      const workCounterBefore = await contract.getTotalWorks();

      await contract.connect(signers.alice).registerWork(10n, "First Work", "Photography");
      const workCounterAfter1 = await contract.getTotalWorks();
      expect(workCounterAfter1).to.equal(workCounterBefore.toBigInt() + 1n);

      await contract.connect(signers.bob).registerWork(20n, "Second Work", "Design");
      const workCounterAfter2 = await contract.getTotalWorks();
      expect(workCounterAfter2).to.equal(workCounterBefore.toBigInt() + 2n);
    });

    it("should track author works", async function () {
      await contract.connect(signers.alice).registerWork(11n, "Work 1", "Art");
      await contract.connect(signers.alice).registerWork(12n, "Work 2", "Music");

      const authorWorks = await contract.getAuthorWorks(signers.alice.address);
      expect(authorWorks.length).to.equal(2);
    });

    it("should increment author work count", async function () {
      const statsBefore = await contract.getAuthorStats(signers.alice.address);
      expect(statsBefore.workCount).to.equal(0);

      await contract.connect(signers.alice).registerWork(21n, "New Work", "Video");

      const statsAfter = await contract.getAuthorStats(signers.alice.address);
      expect(statsAfter.workCount).to.equal(1);
    });
  });

  describe("Work Information", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).registerAuthor(333333n);
      await contract.connect(signers.alice).registerWork(100n, "Sample Work", "Software");
    });

    it("should retrieve work information", async function () {
      const workInfo = await contract.getWorkInfo(1);

      expect(workInfo.registrant).to.equal(signers.alice.address);
      expect(workInfo.title).to.equal("Sample Work");
      expect(workInfo.category).to.equal("Software");
      expect(workInfo.verified).to.be.false;
      expect(workInfo.disputed).to.be.false;
      expect(workInfo.disputeCount).to.equal(0);
    });

    it("should reject invalid work ID", async function () {
      await expect(contract.getWorkInfo(999)).to.be.revertedWith("Invalid work ID");
    });
  });

  describe("Work Verification", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).registerAuthor(444444n);
      await contract.connect(signers.alice).registerWork(200n, "Verification Test", "Literature");
    });

    it("should allow owner to mark work as verified", async function () {
      const tx = await contract.connect(signers.deployer).markWorkAsVerified(1);
      await tx.wait();

      const workInfo = await contract.getWorkInfo(1);
      expect(workInfo.verified).to.be.true;
    });

    it("should emit WorkVerified event", async function () {
      await expect(contract.connect(signers.deployer).markWorkAsVerified(1)).to.emit(contract, "WorkVerified");
    });

    it("should prevent non-owner from marking work as verified", async function () {
      await expect(contract.connect(signers.bob).markWorkAsVerified(1)).to.be.revertedWith("Not authorized");
    });

    it("should reject invalid work ID for verification", async function () {
      await expect(contract.connect(signers.deployer).markWorkAsVerified(999)).to.be.revertedWith("Invalid work ID");
    });
  });

  describe("Dispute Filing", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).registerAuthor(555555n);
      await contract.connect(signers.bob).registerAuthor(666666n);
      await contract.connect(signers.alice).registerWork(300n, "Disputed Work", "Art");
    });

    it("should file dispute successfully", async function () {
      const challengerHash = 300n;
      const tx = await contract.connect(signers.bob).fileDispute(1, challengerHash);
      await tx.wait();

      const workInfo = await contract.getWorkInfo(1);
      expect(workInfo.disputed).to.be.true;
      expect(workInfo.disputeCount).to.equal(1);
    });

    it("should emit DisputeFiled event", async function () {
      await expect(contract.connect(signers.bob).fileDispute(1, 300n)).to.emit(contract, "DisputeFiled");
    });

    it("should prevent unregistered author from filing dispute", async function () {
      await expect(contract.connect(signers.charlie).fileDispute(1, 300n)).to.be.revertedWith(
        "Author not registered",
      );
    });

    it("should prevent author from disputing own work", async function () {
      await expect(contract.connect(signers.alice).fileDispute(1, 300n)).to.be.revertedWith("Cannot dispute own work");
    });

    it("should reject invalid work ID for dispute", async function () {
      await expect(contract.connect(signers.bob).fileDispute(999, 300n)).to.be.revertedWith("Invalid work ID");
    });

    it("should retrieve dispute information", async function () {
      await contract.connect(signers.bob).fileDispute(1, 300n);

      const disputeInfo = await contract.getDisputeInfo(1, 0);
      expect(disputeInfo.challenger).to.equal(signers.bob.address);
      expect(disputeInfo.resolved).to.be.false;
    });

    it("should increment dispute count correctly", async function () {
      await contract.connect(signers.bob).fileDispute(1, 300n);
      const disputeCount1 = await contract.getDisputeCount(1);
      expect(disputeCount1).to.equal(1);

      await contract.connect(signers.charlie).registerAuthor(777777n);
      await contract.connect(signers.charlie).fileDispute(1, 301n);
      const disputeCount2 = await contract.getDisputeCount(1);
      expect(disputeCount2).to.equal(2);
    });
  });

  describe("Author Statistics", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).registerAuthor(888888n);
      await contract.connect(signers.bob).registerAuthor(999999n);
    });

    it("should update work count when work is registered", async function () {
      const statsBefore = await contract.getAuthorStats(signers.alice.address);
      expect(statsBefore.workCount).to.equal(0);

      await contract.connect(signers.alice).registerWork(400n, "First Work", "Photography");
      const statsAfter1 = await contract.getAuthorStats(signers.alice.address);
      expect(statsAfter1.workCount).to.equal(1);

      await contract.connect(signers.alice).registerWork(401n, "Second Work", "Design");
      const statsAfter2 = await contract.getAuthorStats(signers.alice.address);
      expect(statsAfter2.workCount).to.equal(2);
    });

    it("should increment total disputes for both parties", async function () {
      await contract.connect(signers.alice).registerWork(500n, "Disputed Content", "Music");

      const aliceStatsBefore = await contract.getAuthorStats(signers.alice.address);
      const bobStatsBefore = await contract.getAuthorStats(signers.bob.address);

      await contract.connect(signers.bob).fileDispute(1, 500n);

      const aliceStatsAfter = await contract.getAuthorStats(signers.alice.address);
      const bobStatsAfter = await contract.getAuthorStats(signers.bob.address);

      expect(aliceStatsAfter.totalDisputes).to.equal(aliceStatsBefore.totalDisputes + 1);
      expect(bobStatsAfter.totalDisputes).to.equal(bobStatsBefore.totalDisputes + 1);
    });
  });

  describe("Contract Initialization", function () {
    it("should set deployer as owner", async function () {
      const owner = await contract.owner();
      expect(owner).to.equal(signers.deployer.address);
    });

    it("should initialize workCounter to 0", async function () {
      const totalWorks = await contract.getTotalWorks();
      expect(totalWorks).to.equal(0);
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await contract.connect(signers.alice).registerAuthor(101010n);
      await contract.connect(signers.bob).registerAuthor(202020n);
    });

    it("should handle multiple works with same category", async function () {
      await contract.connect(signers.alice).registerWork(601n, "Art 1", "Art");
      await contract.connect(signers.alice).registerWork(602n, "Art 2", "Art");

      const works = await contract.getAuthorWorks(signers.alice.address);
      expect(works.length).to.equal(2);
    });

    it("should handle zero as content hash", async function () {
      const tx = await contract.connect(signers.alice).registerWork(0n, "Zero Hash Work", "Software");
      await tx.wait();

      const totalWorks = await contract.getTotalWorks();
      expect(totalWorks).to.equal(1);
    });

    it("should handle large content hashes", async function () {
      const largeHash = (2n ** 32n) - 1n;
      const tx = await contract.connect(signers.alice).registerWork(largeHash, "Max Hash Work", "Video");
      await tx.wait();

      const totalWorks = await contract.getTotalWorks();
      expect(totalWorks).to.equal(1);
    });

    it("should handle special characters in title and category", async function () {
      const title = "My Work: The Sequel (2024) - Edition #1";
      const category = "Art & Design";

      const tx = await contract.connect(signers.alice).registerWork(700n, title, category);
      await tx.wait();

      const workInfo = await contract.getWorkInfo(1);
      expect(workInfo.title).to.equal(title);
      expect(workInfo.category).to.equal(category);
    });
  });
});
