import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre,{ethers} from "hardhat";
  
  describe("MultisigFactory", function () {
    let multisigFactory: any;
    let owner: any;
    let user1: any;
    let user2: any;
    let user3: any;
  
    beforeEach(async function () {
      [owner, user1, user2, user3] = await ethers.getSigners();
  
      const MultisigFactoryContract = await ethers.getContractFactory("MultisigFactory");
      multisigFactory = await MultisigFactoryContract.deploy();
    //   await multisigFactory.deployed();
    });
  
    it("Should create a new Multisig wallet", async function () {
      const quorum = 2;
      const validSigners = [user1.address, user2.address, user3.address];
  
      const tx = await multisigFactory.createMultisigWallet(quorum, validSigners);
      const receipt = await tx.wait();
  
      const newMultisigAddress = await multisigFactory.getMultiSigClones();
      expect(newMultisigAddress.length).to.equal(1);
  
      const MultisigContract = await ethers.getContractFactory("Multisig");
      const newMultisig = MultisigContract.attach(newMultisigAddress[0]);
  
      expect(await (newMultisig as any).quorum()).to.equal(quorum);
      expect(await (newMultisig as any).noOfValidSigners()).to.equal(validSigners.length + 1);
    });
  
    it("Should create multiple Multisig wallets", async function () {
      const quorum1 = 2;
      const validSigners1 = [user1.address, user2.address, user3.address];
  
      const quorum2 = 3;
      const validSigners2 = [owner.address, user1.address, user2.address, user3.address];
  
      await multisigFactory.createMultisigWallet(quorum1, validSigners1);
      await multisigFactory.createMultisigWallet(quorum2, validSigners2);
  
      const multisigAddresses = await multisigFactory.getMultiSigClones();
      expect(multisigAddresses.length).to.equal(2);
    });
  
    it("Should return the correct number of Multisig clones", async function () {
      const quorum = 2;
      const validSigners = [user1.address, user2.address, user3.address];
  
      for (let i = 0; i < 5; i++) {
        await multisigFactory.createMultisigWallet(quorum, validSigners);
      }
  
      const multisigAddresses = await multisigFactory.getMultiSigClones();
      expect(multisigAddresses.length).to.equal(5);
    });
  
    it("Should create a Multisig wallet with correct parameters", async function () {
      const quorum = 2;
      const validSigners = [user1.address, user2.address, user3.address];
  
      const tx = await multisigFactory.createMultisigWallet(quorum, validSigners);
      const receipt = await tx.wait();
  
      const multisigAddresses = await multisigFactory.getMultiSigClones();
      const newMultisigAddress = multisigAddresses[0];
  
      const MultisigContract = await ethers.getContractFactory("Multisig");
      const newMultisig = MultisigContract.attach(newMultisigAddress);
  
      // The error is occurring because the TypeScript compiler doesn't recognize the 'quorum' and 'noOfValidSigners' properties on the 'newMultisig' object.
      // This is likely due to the contract's ABI not being properly recognized or imported.
      // To fix this, we need to explicitly type the 'newMultisig' object or use a type assertion.
      
      // Option 1: Use type assertion
      expect(await (newMultisig as any).quorum()).to.equal(quorum);
      expect(await (newMultisig as any).noOfValidSigners()).to.equal(validSigners.length + 1);

      // Option 2: If you have a type definition for your Multisig contract, you can use it like this:
      // import { Multisig } from '../typechain-types/Multisig';
      // const newMultisig = MultisigContract.attach(newMultisigAddress) as Multisig;
      // expect(await newMultisig.quorum()).to.equal(quorum);
      // expect(await newMultisig.noOfValidSigners()).to.equal(validSigners.length);

      // Choose the option that best fits your project setup
  
      for (const signer of validSigners) {
        expect(await (newMultisig as any).isValidSigner(signer)).to.be.true;
      }
    });
  });