// https://www.npmjs.com/package/solidity-coverage
// https://docs.ethers.io/v5/
// https://www.chaijs.com/

const { expect } = require("chai");
const { ethers } = require("hardhat");

let market;
let nft;
let owner;
let addr1;
let addr2;
let marketAddress;
let nftContractAddress;

async function createNFT(sender) {
  const token = await nft
    .connect(sender)
    .createToken("https://www.mytokenlocation.com");
  tx = await token.wait();
  let event = tx.events[0];
  let value = event.args[2];
  return (tokenId = value.toNumber());
}

async function createMarketItem(
  nftAddress,
  tokenId,
  auctionPrice,
  listingPrice,
  sender
) {
  return await market
    .connect(sender)
    .createMarketItem(nftAddress, tokenId, auctionPrice, {
      value: listingPrice,
    });
}

function etherToWei(ether) {
  return ethers.utils.parseEther(ether).toString();
}

function askingPriceToWei(etherAmount) {
  let price = ethers.utils.parseEther(etherAmount);
  return (price = price.toString());
}

beforeEach(async () => {
  const Market = await ethers.getContractFactory("NFTMarket");
  market = await Market.deploy();
  market = await market.deployed();
  marketAddress = market.address;

  const NFT = await ethers.getContractFactory("NFT");
  nft = await NFT.deploy(marketAddress);
  nft = await nft.deployed();
  nftContractAddress = nft.address;

  [owner, addr1, addr2, addr3] = await ethers.getSigners();
});

describe("NFT Market Deployment", function () {
  it("Should track the owner", async function () {
    const marketOwner = await market.getOwner();
    expect(marketOwner).to.equal(owner.address);
  });

  it("Should track the listing price", async function () {
    const listingFee = "0.025";
    let listingPrice = await market.getListingPrice();
    listingPrice = ethers.utils.formatUnits(listingPrice.toString(), "ether");
    expect(listingPrice).to.equal(listingFee);
  });
});

describe("Owner only functions", function () {
  it("Should error is msg.sender trys to access owner balance", async function () {
    await expect(market.connect(addr1).getOwnerBalance()).to.be.revertedWith(
      "Only the owner can do this"
    );
  });

  it("Should error is msg.sender trys to access owner address", async function () {
    await expect(market.connect(addr1).getOwner()).to.be.revertedWith(
      "Only the owner can do this"
    );
  });

  it("Should error is msg.sender trys to access owner balance", async function () {
    await expect(market.connect(addr1).getOwnerBalance()).to.be.revertedWith(
      "Only the owner can do this"
    );
  });

  it("Should return owner address if msg.sender is owner", async function () {
    const ownerAddress = await market.getOwner();
    expect(ownerAddress).to.equal(owner.address);
  });

  it("Should return owner balance if msg.sender is owner", async function () {
    const ownerBalance = await market.getOwnerBalance();
    expect(ownerBalance).to.not.equal("0");
  });
});

describe("Place an item for sale on the marketplace", function () {
  it("Should error if asking price is NOT greater than 1 wei", async function () {
    const listingPrice = etherToWei("0.025");
    const auctionPrice = askingPriceToWei("0");

    // Create an NFT
    const tokenId = await createNFT(addr1);

    // Create a market item
    await expect(
      market
        .connect(addr1)
        .createMarketItem(nft.address, tokenId, auctionPrice, {
          value: listingPrice,
        })
    ).to.be.revertedWith("Price must be at least 1 wei");
  });

  it("Should error if the provided listing fee is different than expected", async function () {
    const listingPrice = etherToWei("0.03");
    const auctionPrice = askingPriceToWei("1");

    // Create an NFT
    const tokenId = await createNFT(addr1);

    // Create a market item
    await expect(
      market
        .connect(addr1)
        .createMarketItem(nft.address, tokenId, auctionPrice, {
          value: listingPrice,
        })
    ).to.be.revertedWith("Price must be equal to listing price");
  });

  it("Should increment the market item ID by one after listing item for sale", async function () {
    let itemIds = [];

    for (i = 0; i < 2; i++) {
      const listingPrice = etherToWei("0.025");
      const auctionPrice = askingPriceToWei("1");

      // Create an NFT
      const tokenId = await createNFT(addr1);

      // Place the NFT for sale
      let item = await market
        .connect(addr1)
        .createMarketItem(nft.address, tokenId, auctionPrice, {
          value: listingPrice,
        });

      // Retrieve the item ID from the event object
      let newListing = await item.wait();
      let events = newListing.events;
      let event = events[events.length - 1];
      let value = event.args.itemId;
      let itemId = value.toNumber();
      itemIds.push(itemId);
    }
    expect(itemIds[1]).to.equal(itemIds[0] + 1);
  });

  it("Should transfer ownership of the token to the marketplace ", async function () {
    let originalOwner;
    let marketplaceOwner = "0x0000000000000000000000000000000000000000";
    let newOwner;

    const listingPrice = etherToWei("0.025");
    const auctionPrice = askingPriceToWei("1");

    // Create an NFT
    const tokenId = await createNFT(addr1);
    originalOwner = await nft.ownerOf(tokenId);

    // Place the NFT for sale
    let item = await market
      .connect(addr1)
      .createMarketItem(nft.address, tokenId, auctionPrice, {
        value: listingPrice,
      });

    // Retrieve the item ID from the event object
    let newListing = await item.wait();
    let event = newListing.events[2];
    let value = event.args.owner;
    newOwner = value;

    expect(originalOwner).to.not.eq(newOwner);
    expect(newOwner).to.eq(marketplaceOwner);
  });

  it("Should emit a MarketItemStatus event", async function () {
    // Set the listing fee
    const listingPrice = etherToWei("0.025");
    const auctionPrice = askingPriceToWei("1");

    // Create an NFT
    const tokenId = await createNFT(addr1);

    // Place the NFT for sale
    let item = await market
      .connect(addr1)
      .createMarketItem(nft.address, tokenId, auctionPrice, {
        value: listingPrice,
      });

    // Retrieve the item ID from the event object
    let newListing = await item.wait();
    let events = newListing.events;
    let event = events[events.length - 1];
    let args = event.args;

    expect(event.event).to.eq("MarketItemStatus");
    expect(args.itemId.toString()).to.eq("1");
    expect(args.nftContract.toString()).to.eq(nft.address);
    expect(args.tokenId.toString()).to.eq(tokenId.toString());
    expect(args.seller.toString()).to.eq(addr1.address);
    expect(args.owner.toString()).to.eq(
      "0x0000000000000000000000000000000000000000"
    );
    expect(args.price.toString()).to.eq(auctionPrice.toString());
    expect(args.sold).to.eq(false);
  });
});

describe("Sell an item on the marketplace", function () {
  const listingPrice = etherToWei("0.025");
  const auctionPrice = askingPriceToWei("1");

  beforeEach(async () => {
    // Create an NFT
    tokenId = await createNFT(addr1);

    // Place the NFT for sale
    let result = await createMarketItem(
      nftContractAddress,
      tokenId,
      auctionPrice,
      listingPrice,
      addr1
    );
    result = await result.wait();
  });

  it("Should error if the wrong asking price is entered", async function () {
    // Create a market sale
    await expect(
      market.connect(addr1).createMarketSale(nftContractAddress, tokenId, {
        value: etherToWei("2"),
      })
    ).to.be.revertedWith(
      "Please submit the asking price in order to complete the purchase"
    );
  });

  it("Should provide the seller with payment", async function () {
    // Determine the balance of the seller
    let previousBalance = await nft.balanceOf(addr2.address);
    previousBalance = ethers.utils.parseEther(previousBalance.toString());

    // Create a market sale
    let sale = await market
      .connect(addr2)
      .createMarketSale(nftContractAddress, tokenId, {
        value: auctionPrice,
      });

    // Mine the transaction
    sale = await sale.wait();

    // Determine the balance of the seller
    let currentBalance = await nft.balanceOf(addr2.address);
    currentBalance = ethers.utils.parseEther(currentBalance.toString());

    expect(currentBalance).to.eq(previousBalance + auctionPrice);
  });

  it("Should transfer ownership to the seller. Update NFT contract", async function () {
    // Determine the previous owner of the token
    const previousOwner = await nft.ownerOf(tokenId);

    // Create a market sale
    let sale = await market
      .connect(addr1)
      .createMarketSale(nftContractAddress, tokenId, {
        value: auctionPrice,
      });

    // Mine the transaction
    sale = await sale.wait();

    // Determine the new owner of the token
    const newOwner = await nft.ownerOf(tokenId);

    expect(newOwner).to.not.eq(previousOwner);
    expect(newOwner).to.eq(addr1.address);
  });

  it("Should update the item owner within the marketplace.", async function () {
    // Create a market sale
    let tx = await market
      .connect(addr2)
      .createMarketSale(nftContractAddress, tokenId, {
        value: auctionPrice,
      });

    // Mine the transaction
    tx = await tx.wait();

    // Determine the sold status of the item
    let events = tx.events;
    let event = tx.events[events.length - 1];
    let owner = event.args.owner;

    expect(owner).to.eq(addr2.address);
  });

  it("Should marked the item as sold", async function () {
    // Create a market sale
    let tx = await market
      .connect(addr2)
      .createMarketSale(nftContractAddress, tokenId, {
        value: auctionPrice,
      });

    // Mine the transaction
    tx = await tx.wait();

    // Determine the sold status of the item
    let events = tx.events;
    let event = tx.events[events.length - 1];
    let sold = event.args.sold;

    expect(sold).to.eq(true);
  });

  it("Should provide the listing Fee to the marketplace contract owner", async function () {
    // Determine the balance of the marketplace contract owner
    let previousOwnerBalance = await market.getOwnerBalance();

    // Create a market sale
    let tx = await market
      .connect(addr2)
      .createMarketSale(nftContractAddress, tokenId, {
        value: auctionPrice,
      });

    // Mine the transaction
    tx = await tx.wait();

    // Determine the balance of the marketplace contract owner
    let currentOwnerBalance = await market.getOwnerBalance();

    expect(currentOwnerBalance.toString())
      .to.eq(previousOwnerBalance.add(listingPrice))
      .toString();
  });

  it("Should emit a MarketItemStatus event", async function () {
    // Create a market sale
    let tx = await market
      .connect(addr2)
      .createMarketSale(nftContractAddress, tokenId, {
        value: auctionPrice,
      });

    // Mine the transaction
    tx = await tx.wait();

    // Determine the sold status of the item
    let events = tx.events;
    let event = events[events.length - 1].event;

    expect(event).to.eq("MarketItemStatus");
  });
});

describe("Returning marketplace items", function () {
  it("Should return an array of all items available for sale in the marketplace", async function () {
    let items;

    for (i = 0; i < 2; i++) {
      // Set the listing fee
      const listingPrice = etherToWei("0.025");
      const auctionPrice = askingPriceToWei("1");

      // Create an NFT
      const tokenId = await createNFT(addr1);

      // Place the NFT for sale
      let item = await market
        .connect(addr1)
        .createMarketItem(nft.address, tokenId, auctionPrice, {
          value: listingPrice,
        });

      await item.wait();

      // fetch market items
      items = await market.fetchMarketItems();
    }
    expect(items.length).to.eq(2);
  });

  it("Should only return the items from the marketplace purchased by msg.sender", async function () {
    // Place 2 items in the marketplace
    for (i = 0; i < 3; i++) {
      // Set the listing fee
      const listingPrice = etherToWei("0.025");
      const auctionPrice = askingPriceToWei("1");

      // Create an NFT
      const tokenId = await createNFT(addr1);

      // Place the NFT for sale
      let item = await market
        .connect(addr1)
        .createMarketItem(nft.address, tokenId, auctionPrice, {
          value: listingPrice,
        });

      await item.wait();
    }
    // fetch all market items
    let allItems = await market.fetchMarketItems();

    // Create a market sale
    let sale = await market
      .connect(addr2)
      .createMarketSale(nftContractAddress, tokenId, {
        value: askingPriceToWei("1"),
      });

    await sale.wait();

    // fetch sender market items
    let myItems = await market.connect(addr2).fetchMyNFTs();

    expect(allItems).to.be.an("array");
    expect(allItems.length).to.eq(3);
    expect(myItems).to.be.an("array");
    expect(myItems.length).to.eq(1);
  });

  it("Should only return the items from the marketplace created by msg.sender", async function () {
    let createdBy;

    // Place 2 items in the marketplace
    for (i = 0; i < 3; i++) {
      // Set the listing fee
      const listingPrice = etherToWei("0.025");
      const auctionPrice = askingPriceToWei("1");

      // Create an NFT
      i == 2 ? (createdBy = addr2) : (createdBy = addr1);
      const tokenId = await createNFT(createdBy);

      // Place the NFT for sale
      let item = await market
        .connect(createdBy)
        .createMarketItem(nft.address, tokenId, auctionPrice, {
          value: listingPrice,
        });

      await item.wait();
    }
    // fetch all market items
    let allItems = await market.fetchMarketItems();

    // fetch sender market items
    let myCreatedItems = await market.connect(addr2).fetchItemsCreated();

    expect(allItems).to.be.an("array");
    expect(allItems.length).to.eq(3);
    expect(myCreatedItems).to.be.an("array");
    expect(myCreatedItems.length).to.eq(1);
  });
});
