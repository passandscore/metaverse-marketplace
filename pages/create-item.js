// https://reactjs.org/docs/getting-started.html
// https://www.npmjs.com/package/web3modal
// https://docs.ethers.io/v5/
// https://www.npmjs.com/package/ipfs-http-client
// https://infura.io/docs

import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import Image from "next/Image";
import Head from "next/head";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import { nftaddress, nftmarketaddress } from "../config";

// ABIs
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  // Store the NFT image url on IPFS
  // Update the formInput state
  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  // Update the form input state
  // Store the FILE metadata on IPFS
  async function createMarket() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  // Create the NFT
  // Add the NFT to the Market
  async function createSale(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();
    let event = tx.events[0]; // contract event return value.
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
    router.push("/");
  }

  return (
    <>
      <Head>
        <title>NFT Marketplace | Create</title>
      </Head>

      <div className="p-4">
        <h2 className="text-2xl py-2 text-center bg-gray-100 ">Create Asset</h2>
        <div className="flex justify-center">
          <div className="w-1/2 flex flex-col pb-12">
            <input
              placeholder="Asset Name"
              className="mt-8 border rounded p-4"
              onChange={(e) =>
                updateFormInput({ ...formInput, name: e.target.value })
              }
            />
            <textarea
              placeholder="Asset Description"
              className="mt-2 border rounded p-4"
              onChange={(e) =>
                updateFormInput({ ...formInput, description: e.target.value })
              }
            />
            <input
              placeholder="Asset Price in Matic"
              className="mt-2 border rounded p-4"
              onChange={(e) =>
                updateFormInput({ ...formInput, price: e.target.value })
              }
            />

            <input
              type="file"
              name="Asset"
              className="my-4"
              onChange={onChange}
            />

            {fileUrl && (
              <div className="grid grid-cols-1 items-center">
                <Image
                  src={fileUrl}
                  alt="NFT"
                  width="350"
                  height="350"
                  objectFit="contain"
                />
              </div>
            )}
            <button
              onClick={createMarket}
              className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
            >
              Create Digital Asset
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
