// https://reactjs.org/docs/getting-started.html
// https://www.npmjs.com/package/web3modal
// https://docs.ethers.io/v5/
// https://www.npmjs.com/package/ipfs-http-client
// https://infura.io/docs

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

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
  const [loadedNfts, setLoadedNfts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();

    // msg.sender is the address of the user who is currently logged in
    // It is used to get the user's NFTs by the smart contract
    // This is why a signer is required
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadedNfts(true);
    setIsLoading(false);
  }

  if (loadedNfts && !nfts.length)
    return (
      <h1 className="py-10 px-20 text-3xl">No assets have been purchased</h1>
    );

  return (
    <>
      <Head>
        <title>NFT Marketplace | Assets</title>
      </Head>

      {isLoading ? (
        <div className="flex justify-center mt-20">
          <Image
            src={"/loading-spinner.gif"}
            alt="Loader"
            width="200"
            height="200"
          />
        </div>
      ) : (
        <div className="p-4  items-center">
          <div className="flex justify-center ">
            <div className="px-4">
              <h2 className="text-2xl py-2 text-center bg-gray-100 rounded ">
                My Assets
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
      )}
    </>
  );
}
