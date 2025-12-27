// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Example Contract
 * @notice This is a template contract demonstrating FHEVM usage
 * @dev Replace this with your actual contract implementation
 */
contract ExampleContract is SepoliaConfig {
    // Example state variable using encrypted type
    euint32 private encryptedValue;

    event ValueSet(uint256 timestamp);

    /**
     * @notice Constructor - Initialize the contract
     */
    constructor() {
        // Initialize encryptedValue if needed
    }

    /**
     * @notice Example function using encrypted computation
     * @param encryptedInput The encrypted input value
     * @param inputProof The zero-knowledge proof for the encrypted input
     */
    function setEncryptedValue(euint32 encryptedInput, bytes calldata inputProof) external {
        euint32 result = FHE.asEuint32(encryptedInput);

        encryptedValue = result;

        // Grant permissions to contract and sender
        FHE.allowThis(encryptedValue);
        FHE.allow(encryptedValue, msg.sender);

        emit ValueSet(block.timestamp);
    }

    /**
     * @notice Get the encrypted value (only for testing in mock environment)
     * @return The encrypted value
     */
    function getEncryptedValue() external view returns (euint32) {
        return encryptedValue;
    }
}
