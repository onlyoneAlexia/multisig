import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre,{ethers} from "hardhat";

// ... rest of your imports and code ...

describe("multisig", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployToken() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const erc20Token = await hre.ethers.getContractFactory("Alexia");
    const token = await erc20Token.deploy();

    return { token };
  }
  async function deployMultisig() {
    // Contracts are deployed using the first signer/account by default
    const [owner,otherAccount, user1, user2, user3, user4, user5] = await hre.ethers.getSigners();
    console.log(user1);
    console.log(user2.address);
    console.log(user3.address);
    console.log(user4.address);
    console.log(user5.address);

    const { token } = await loadFixture(deployToken)
    
    const quorum = 3;
    const validSigners = [user1, user2, user3, user4];

    const Contract = await hre.ethers.getContractFactory("Multisig");
    const multisigContract = await Contract.deploy(quorum, validSigners);

    return { multisigContract, owner, validSigners, user4,user5, otherAccount, token};
  }

  describe("Deployment", function () {

    it("Should set the right quorum", async function () {

      const { multisigContract } = await loadFixture(deployMultisig);

      expect(await multisigContract.quorum()).to.equal(3);
    });

    it("should check if noOfValid Signers is 4", async function () {

      const { multisigContract } = await loadFixture(deployMultisig);
      expect(await multisigContract.noOfValidSigners()).to.equal(4 + 1);

    });
  });

  describe("Transactions", function () {

    it("Should return true or false if user is a valid signer or not", async function () {
  
      const { multisigContract , owner, user4, user5} = await loadFixture(deployMultisig);
      
      expect(await multisigContract.isValidSigner(owner)).to.be.true;
      expect(await multisigContract.isValidSigner(user5)).to.be.false;


    })
  });

   //transfer, approve transaction,update quorum, and approve for update quorum.
   describe("Transfer", function () {
    const trsfAmount = ethers.parseUnits("10", 18);
    describe("Validations", function () {
      it("Should revert with the right error if called by non signer address", async function () {
        const {multisigContract, owner, validSigners, user5, otherAccount, token } = await loadFixture(deployMultisig);

        await expect(multisigContract.connect(otherAccount).transfer(trsfAmount, otherAccount, token)).to.be.revertedWith(
          "invalid signer"
        );
      });

      it("Should revert with the right error if transfer amount is 0", async function () {
        const { multisigContract, owner, validSigners, user5, otherAccount, token} = await loadFixture(deployMultisig);

        await expect(multisigContract.transfer(0, otherAccount, token)).to.be.revertedWith(
          "can't send zero amount"
        );
      });
      it("Should initiate a transaction and emit an event on transfer", async function () {
        const {multisigContract, owner, validSigners, user5, otherAccount, token} = await loadFixture(deployMultisig);

        //  Transfer ERC20 token from owner to contract to pass the insufficient balance check
        const trfAmount = ethers.parseUnits("1000", 18);
        await token.transfer(multisigContract, trfAmount);
        expect(await token.balanceOf(multisigContract)).to.equal(trfAmount);

        await expect(multisigContract.transfer(trsfAmount, otherAccount, token))
          .to.emit(multisigContract, "TransferInitiated")
          .withArgs(anyValue, anyValue); // We accept any value as when arg

        expect(await multisigContract.getCount()).to.equal(1);
        expect(await multisigContract.hasSigned(owner, 1)).to.equal(true);
      });
    });
  });

  describe("Approval", function () {
    const trsfAmount = ethers.parseUnits("10", 18);
    it("Should correctly approve a transaction", async function () {
      const { multisigContract, owner, validSigners, user4, otherAccount, token} = await loadFixture(deployMultisig);

      //  Transfer ERC20 token from owner to contract to pass the insufficient balance check
      const trfAmount = ethers.parseUnits("1000", 18);
      await token.transfer(multisigContract, trfAmount);
      expect(await token.balanceOf(multisigContract)).to.equal(trfAmount);

      await expect(multisigContract.transfer(trsfAmount, otherAccount, token))
        .to.emit(multisigContract, "TransferInitiated")
        .withArgs(anyValue, anyValue); // We accept any value as when arg

      expect(await multisigContract.getCount()).to.equal(1);
      expect(await multisigContract.hasSigned(owner, 1)).to.equal(true);

      const txStruct = await multisigContract.getTx(1);
      const caller = await multisigContract.connect(user4).approveTx(1)  
      // // const callernot =  

      if (txStruct.isCompleted) {
        expect(caller).to.be.revertedWith("transaction already completed"); 
        expect(await token.balanceOf(otherAccount)).to.equal(trsfAmount); 
      }
      expect(caller).to.emit(multisigContract, "ApprovalSuccessful");
      expect(caller).to.be.revertedWith("invalid tx id");
      expect(caller).to.be.revertedWith("can't sign twice");
      expect(caller).to.be.revertedWith("not a valid signer");
     
    });
  });

    
describe("Update Quorum", function () {
    const newQuorum = 3;
    describe("Validations", function () {
      it("Should revert with the right error if called by non signer address", async function () {
        const {multisigContract, owner, validSigners, user5, otherAccount, token} = await loadFixture(deployMultisig);

        await expect(multisigContract.connect(otherAccount).updateQuorum(newQuorum)).to.be.revertedWith(
          "invalid signer"
        );
      });
      it("Should initiate a quorum update and emit an event", async function () {
        const { multisigContract, owner, validSigners, user5, otherAccount, token} = await loadFixture(deployMultisig);

        await expect(multisigContract.updateQuorum(newQuorum))
          .to.emit(multisigContract, "QuorumUpdateInitiated"); // We accept any value as when arg

        expect(await multisigContract.getCount()).to.equal(1);
        expect(await multisigContract.hasSigned(owner, 1)).to.equal(true);
        expect(await multisigContract.pendingQuorum()).to.equal(newQuorum);
      });
    });
  });

  describe("Quorum Approval", function () {
    const newQuorum = 3;
    it("Should correctly approve a quorum update", async function () {
      const { multisigContract, owner, validSigners, user4, otherAccount, token} = await loadFixture(deployMultisig);

      await expect(multisigContract.updateQuorum(newQuorum))
        .to.emit(multisigContract, "QuorumUpdateInitiated");

      expect(await multisigContract.getCount()).to.equal(1);
      expect(await multisigContract.hasSigned(owner, 1)).to.equal(true);
      expect(await multisigContract.pendingQuorum()).to.equal(newQuorum);

      const txStruct = await multisigContract.getTx(1);
      const caller = await multisigContract.connect(user4).approveQuorumUpdate(1);
      // // const callernot =  

      if (txStruct.isCompleted) {
        expect(caller).to.be.revertedWith("transaction already completed");  
      }
      expect(caller).to.emit(multisigContract, "QuorumUpdateSuccessful");
      expect(caller).to.be.revertedWith("invalid tx id");
      expect(caller).to.be.revertedWith("can't sign twice");
      expect(caller).to.be.revertedWith("not a valid signer");
      expect(await multisigContract.quorum()).to.equal(newQuorum);
    });
  });

});