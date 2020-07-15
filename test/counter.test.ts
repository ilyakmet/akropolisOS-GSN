import {
  CounterInstance,
  RecipientInstance,
  IRelayHubInstance,
} from "../types/contracts";

const { expect } = require("chai");

const {
  accounts: [owner, _],
  accounts,
  contract,
  web3,
} = require("@openzeppelin/test-environment");

const { deployRelayHub, fundRecipient } = require("@openzeppelin/gsn-helpers");

const { BN } = require("@openzeppelin/test-helpers");

const Counter = contract.fromArtifact("Counter");
const Recipient = contract.fromArtifact("Recipient");
const IRelayHub = contract.fromArtifact("IRelayHub");

describe("GSNRecipient", async () => {
  let counterInstance: CounterInstance;
  let recipientInstance: RecipientInstance;
  let irelayHubInstance: IRelayHubInstance;

  before(async function() {
    await deployRelayHub(web3, { from: owner });
  });

  context("when called directly", function() {
    beforeEach(async function() {
      counterInstance = await Counter.new();

      // @ts-ignore
      recipientInstance = await Recipient.new(counterInstance.address);

      irelayHubInstance = await IRelayHub.at(
        "0xD216153c06E857cD7f72665E0aF1d7D82172F494"
      );

      // @ts-ignore
      await fundRecipient(web3, { recipient: recipientInstance.address });
    });

    it("should increase counter", async function() {
      const recipientPreBalance = await irelayHubInstance.balanceOf(
        // @ts-ignore
        recipientInstance.address
      );
      const senderPreBalance = await web3.eth.getBalance(_);

      const {
        receipt: { from },
        // @ts-ignore
      } = await recipientInstance.sendTransaction({
        from: _,
        data: "0xe8927fbc",
        useGSN: false,
      });

      const value = await counterInstance.value();

      const recipientPostBalance = await irelayHubInstance.balanceOf(
        // @ts-ignore
        recipientInstance.address
      );

      const senderPostBalance = await web3.eth.getBalance(_);

      expect(recipientPreBalance).to.be.bignumber.equal(recipientPostBalance);
      expect(senderPreBalance).to.be.bignumber.above(senderPostBalance);
      expect(value).to.be.bignumber.equal(new BN(1));
      expect(from.toUpperCase()).equal(_.toUpperCase());
    });
  });

  context("when relay-called", function() {
    beforeEach(async function() {
      counterInstance = await Counter.new();

      // @ts-ignore
      recipientInstance = await Recipient.new(counterInstance.address);

      irelayHubInstance = await IRelayHub.at(
        "0xD216153c06E857cD7f72665E0aF1d7D82172F494"
      );

      // @ts-ignore
      await fundRecipient(web3, { recipient: recipientInstance.address });
    });

    it("should increase counter", async function() {
      const recipientPreBalance = await irelayHubInstance.balanceOf(
        // @ts-ignore
        recipientInstance.address
      );
      const senderPreBalance = await web3.eth.getBalance(_);

      const {
        receipt: { from },
        // @ts-ignore
      } = await recipientInstance.sendTransaction({
        from: _,
        data: "0xe8927fbc",
        useGSN: true,
      });

      const value = await counterInstance.value();

      const recipientPostBalance = await irelayHubInstance.balanceOf(
        // @ts-ignore
        recipientInstance.address
      );

      const senderPostBalance = await web3.eth.getBalance(_);

      expect(recipientPreBalance).to.be.bignumber.above(recipientPostBalance);
      expect(senderPreBalance).to.be.bignumber.equal(senderPostBalance);
      expect(value).to.be.bignumber.equal(new BN(1));
      expect(from.toUpperCase()).equal(accounts[9].toUpperCase());
    });
  });
});
