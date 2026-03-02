import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";

describe("FlapMintNFT", () => {
  let ethers: any;
  let nft: any;
  let owner: any, user1: any, user2: any;

  const metadata = {
    name: "TestAgent",
    persona: "A meme token launcher",
    voiceHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    animationURI: "",
    vaultURI: "",
    vaultHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    avatarId: 0,
  };

  before(async () => {
    const connection = await hre.network.connect();
    ethers = connection.ethers;
    const signers = await ethers.getSigners();
    owner = signers[0];
    user1 = signers[1];
    user2 = signers[2];
  });

  async function deployFresh() {
    const Factory = await ethers.getContractFactory("FlapMintNFT");
    return await Factory.deploy();
  }

  describe("Minting", () => {
    it("should mint an agent NFT", async () => {
      const nft = await deployFresh();
      const tx = await nft.connect(user1).mintAgent(metadata, 0, user2.address);
      await tx.wait();
      assert.equal(await nft.ownerOf(0), user1.address);
      assert.equal(await nft.totalAgents(), 1n);
    });

    it("should store agent info", async () => {
      const nft = await deployFresh();
      await nft.connect(user1).mintAgent(metadata, 1, user2.address);
      const info = await nft.getAgentInfo(0);
      assert.equal(info.strategy, 1n);
      assert.equal(info.agentWallet, user2.address);
      assert.equal(info.tokensLaunched, 0n);
    });

    it("should store metadata", async () => {
      const nft = await deployFresh();
      await nft.connect(user1).mintAgent(metadata, 0, user2.address);
      const m = await nft.getAgentMetadata(0);
      assert.equal(m.name, "TestAgent");
      assert.equal(m.persona, "A meme token launcher");
    });

    it("should enforce max agents per address", async () => {
      const nft = await deployFresh();
      for (let i = 0; i < 5; i++) {
        await nft.connect(user1).mintAgent(metadata, 0, user2.address);
      }
      await assert.rejects(
        nft.connect(user1).mintAgent(metadata, 0, user2.address),
        /Max agents reached/
      );
    });
  });

  describe("Lifecycle", () => {
    it("should pause and unpause", async () => {
      const nft = await deployFresh();
      await nft.connect(user1).mintAgent(metadata, 0, user2.address);
      await nft.connect(user1).pauseAgent(0);
      assert.equal(await nft.getState(0), 1n);
      await nft.connect(user1).unpauseAgent(0);
      assert.equal(await nft.getState(0), 0n);
    });

    it("should terminate", async () => {
      const nft = await deployFresh();
      await nft.connect(user1).mintAgent(metadata, 0, user2.address);
      await nft.connect(user1).terminateAgent(0);
      assert.equal(await nft.getState(0), 2n);
    });
  });

  describe("Funding", () => {
    it("should fund and withdraw", async () => {
      const nft = await deployFresh();
      await nft.connect(user1).mintAgent(metadata, 0, user2.address);
      await nft.connect(user1).fundAgent(0, { value: ethers.parseEther("1") });
      assert.equal(await nft.getAgentBalance(0), ethers.parseEther("1"));

      const balBefore = await ethers.provider.getBalance(user1.address);
      await nft.connect(user1).withdrawFromAgent(0, ethers.parseEther("0.5"));
      const balAfter = await ethers.provider.getBalance(user1.address);
      assert.ok(balAfter > balBefore);
      assert.equal(await nft.getAgentBalance(0), ethers.parseEther("0.5"));
    });
  });

  describe("Token Launch Tracking", () => {
    it("should record token launches", async () => {
      const nft = await deployFresh();
      await nft.connect(user1).mintAgent(metadata, 0, user2.address);
      await nft.connect(user1).recordTokenLaunch(
        0,
        "0x0000000000000000000000000000000000001234",
        "TestToken",
        "TT",
        ethers.parseEther("0.1")
      );

      const launches = await nft.getTokenLaunches(0);
      assert.equal(launches.length, 1);
      assert.equal(launches[0].name, "TestToken");
      assert.equal(launches[0].symbol, "TT");

      const info = await nft.getAgentInfo(0);
      assert.equal(info.tokensLaunched, 1n);
      assert.equal(info.totalBNBDeployed, ethers.parseEther("0.1"));
    });
  });
});
