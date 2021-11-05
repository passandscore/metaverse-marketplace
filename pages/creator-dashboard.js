// https://reactjs.org/docs/getting-started.html
// https://www.npmjs.com/package/web3modal
// https://docs.ethers.io/v5/

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { nftmarketaddress, nftaddress } from "../config";

import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const accounts = await provider.listAccounts();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchItemsCreated();

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
          sold: i.sold,
          tokenDetails: tokenUri,
        };
        return item;
      })
    );

    /* create a filtered array of items that have been sold */
    const soldItems = items.filter((i) => i.sold);
    setSold(soldItems);
    setNfts(items);
    setLoadingState("loaded");
  }
  if (loadingState === "loaded" && !nfts.length)
    return (
      <>
        <Head>
          <title>NFT Marketplace | Dashboard</title>
        </Head>
        <h1 className="py-10 px-20 text-3xl">No assets created</h1>;
      </>
    );

  return (
    <>
      <Head>
        <title>NFT Marketplace | Dashboard</title>
      </Head>
      <div>
        <div className="p-4">
          <div className="flex justify-center">
            <div className="px-4" style={{ maxWidth: "1600px" }}>
              <h2 className="text-2xl py-2 text-center bg-gray-100">
                Items Created
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {nfts.map((nft, i) => (
                  <div
                    key={i}
                    className="border shadow rounded-xl overflow-hidden"
                  >
                    <Link href={nft.image} className="cursor-pointer ">
                      <a target="_blank">
                        <Image
                          src={nft.image}
                          alt="NFT"
                          width="350"
                          height="350"
                          objectFit="contain"
                          href={nft.tokenDetails}
                        />
                      </a>
                    </Link>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4">
        {Boolean(sold.length) && (
          <div>
            <div className="flex justify-center">
              <div className="px-4" style={{ maxWidth: "1600px" }}>
                <h2 className="text-2xl py-2 text-center bg-gray-100 ">
                  Items sold
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  {sold.map((nft, i) => (
                    <div
                      key={i}
                      className="border shadow rounded-xl overflow-hidden"
                    >
                      <Link href={nft.image} className="cursor-pointer ">
                        <a target="_blank">
                          <Image
                            src={nft.image}
                            alt="NFT"
                            width="350"
                            height="350"
                            objectFit="contain"
                            href={nft.tokenDetails}
                          />
                        </a>
                      </Link>
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
