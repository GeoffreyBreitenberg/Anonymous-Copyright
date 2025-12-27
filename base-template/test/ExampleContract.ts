import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { ExampleContract, ExampleContract__factory } from "../types";
import { expect } from "chai";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("ExampleContract")) as ExampleContract__factory;
  const contract = (await factory.deploy()) as ExampleContract;
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}

describe("ExampleContract", function () {
  let signers: Signers;
  let contract: ExampleContract;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1] };
  });

  beforeEach(async function () {
    // Skip tests if not running in mock FHEVM environment
    if (!fhevm.isMock) {
      console.warn("This test suite cannot run on Sepolia Testnet");
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  it("should set encrypted value", async function () {
    const clearValue = 42;
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearValue)
      .encrypt();

    const tx = await contract
      .connect(signers.alice)
      .setEncryptedValue(encryptedInput.handles[0], encryptedInput.inputProof);
    await tx.wait();

    const encryptedValue = await contract.getEncryptedValue();
    expect(encryptedValue).to.not.equal(ethers.ZeroHash);
  });

  it("should emit ValueSet event", async function () {
    const clearValue = 100;
    const encryptedInput = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .add32(clearValue)
      .encrypt();

    await expect(
      contract.connect(signers.alice).setEncryptedValue(encryptedInput.handles[0], encryptedInput.inputProof),
    ).to.emit(contract, "ValueSet");
  });
});
