const { expect } = require("chai");
const { ethers } = require("hardhat");
require("chai").use(require("chai-as-promised")).should();

let market;
let nft;
let owner;
let addr1;
let addr2;
let addrs;

beforeEach(async () => {
  const Market = await ethers.getContractFactory("NFTMarket");
  market = await Market.deploy();
  market = await market.deployed();
  const marketAddress = market.address;

  const NFT = await ethers.getContractFactory("NFT");
  nft = await NFT.deploy(marketAddress);
  nft = await nft.deployed();

  [owner, addr1, addr2, addr3] = await ethers.getSigners();
});

describe("NFT Deployment", function () {
  it("Should track the contract address", async function () {
    expect(await nft.contractAddress()).to.be.eq(market.address);
  });
});

describe("NFT Token Creation", function () {
  let tokens = [];

  it("Should update the tokenId count", async function () {
    for (i = 0; i < 2; i++) {
      const token = await nft.createToken(
        `https://www.mytokenlocation-${i}.com`
      );
      let tx = await token.wait();
      let event = tx.events[0];
      let value = event.args[2];
      let tokenId = value.toNumber();
      tokens.push(tokenId);
    }
    expect(tokens[0]).to.be.eq(tokens[1] - 1);
  });

  it("Should update the users token balance", async function () {
    const before = await nft.balanceOf(owner.address);
    const token = await nft.createToken(`https://www.mytokenlocation.com`);
    await token.wait();
    const after = await nft.balanceOf(owner.address);
    expect(after.toNumber()).to.be.eq(before.toNumber() + 1);
  });

  it("Should set the sender as the token owner", async function () {
    const token = await nft.createToken(`https://www.mytokenlocation.com`);
    const tx = await token.wait();
    const event = tx.events[0];
    const value = event.args[2];
    const tokenId = value.toNumber();
    const tokenOwner = await nft.ownerOf(tokenId);
    expect(owner.address).to.be.eq(tokenOwner);
  });

  it("Should emit a transfer event", async function () {
    const token = await nft.createToken(`https://www.mytokenlocation.com`);
    const tx = await token.wait();
    const event = tx.events[0].event;
    expect(event).to.be.eq("Transfer");
  });
});
