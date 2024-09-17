import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AlexiaModule = buildModule("AlexiaModule", (m) => {

    const erc20 = m.contract("Alexia");

    return { erc20 };
});



export default AlexiaModule;


