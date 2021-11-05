// https://reactjs.org/docs/getting-started.html
// https://axios-http.com/docs/intro
// https://www.npmjs.com/package/web3modal
// https://docs.ethers.io/v5/

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";

import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import Router from "next/router";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadNFTs();

    addWalletListener();
  }, []);

  async function addWalletListener() {
    const addressArray = await window.ethereum.request({
      method: "eth_accounts",
    });
    addressArray.length > 0 && setIsConnected(true);

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        accounts.length > 0 ? setIsConnected(true) : setIsConnected(false);
      });
    }
  }

  async function loadNFTs() {
    // Using a generic provider as we don't need to know anything about the user. (READ ONLY)
    const provider = new ethers.providers.JsonRpcProvider(
      "https://matic-mumbai.chainstacklabs.com"
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    );
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri); // ipfs endpoint
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          itemId: i.itemId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          tokenDetails: tokenUri,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }

  async function buyNft(nft) {
    //Navigate the user to the transaction page
    Router.push("/purchase-transaction-process");

    // Look for new ethereum instance injected by into the browser
    const web3Modal = new Web3Modal();

    // Connect to that instance
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    // Get the user's wallet information
    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    // Format the price
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    try {
      // Construct the transaction
      const transaction = await contract.createMarketSale(
        nftaddress,
        nft.itemId,
        {
          value: price,
        }
      );
      await transaction.wait();
      loadNFTs();
    } catch (error) {
      console.log(error);
      Router.push("/");
    }
    //Navigate the user to the home page
    Router.push("/");
  }

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;

  return (
    <>
      <Head>
        <title>NFT Marketplace | Home</title>
      </Head>
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: "1600px" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 mt-8">
            {nfts.map((nft, i) => (
              <div
                key={i}
                className="border  rounded-xl overflow-hidden hover:shadow-xl"
              >
                <Link href={nft.image} className="cursor-pointer ">
                  <a target="_blank">
                    <Image
                      src={nft.image}
                      alt="NFT"
                      width="350"
                      height="350"
                      href={nft.tokenDetails}
                      objectFit="contain"
                    />
                  </a>
                </Link>
                <div className="p-4">
                  <p
                    style={{ height: "64px" }}
                    className="text-2xl font-semibold"
                  >
                    {nft.name}
                  </p>
                  <div style={{ height: "70px", overflow: "hidden" }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className=" p-4 bg-black">
                  <div className="flex justify-end items-center  ">
                    <Image
                      src="/matic-token-icon.webp"
                      alt="Matic Token Image"
                      width="30"
                      height="30"
                      objectFit="contain"
                    />
                    <p className=" ml-2 text-2xl  font-bold text-white cursor-default">
                      {nft.price}
                    </p>
                  </div>

                  <>
                    <button
                      className="mt-2 w-full bg-pink-500 cursor-pointer text-white font-bold py-2 px-12 rounded"
                      style={{
                        display: isConnected ? "block" : "none",
                      }}
                      onClick={() => buyNft(nft)}
                    >
                      Buy
                    </button>

                    <Link href={nft.tokenDetails}>
                      <a target="_blank">
                        <button className="mt-2  cursor-pointer w-full bg-pink-500 text-white font-bold py-2 px-12 rounded ">
                          Details
                        </button>
                      </a>
                    </Link>
                  </>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
