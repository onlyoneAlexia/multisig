import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";
const MultisigModule = buildModule("MultisigModule", (m) => {
    const quorum = 3;
    const validSigners = [
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
    ];
    const MultisigContract = m.contract("Multisig", [quorum, validSigners]);

    return { MultisigContract };
});



export default MultisigModule;



