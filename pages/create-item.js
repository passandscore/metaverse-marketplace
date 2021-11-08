// https://reactjs.org/docs/getting-started.html
// https://www.npmjs.com/package/web3modal
// https://docs.ethers.io/v5/
// https://www.npmjs.com/package/ipfs-http-client
// https://infura.io/docs
// https://www.npmjs.com/package/react-toastify
// https://www.npmjs.com/package/axios

import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import axios from "axios";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [isTransacting, setIsTransacting] = useState(false);
  const [successfulTransaction, setSuccessfulTransaction] = useState(false);
  const [nftTxHash, setNftTxHash] = useState("");
  const [marketTxHash, setMarketTxHash] = useState("");
  const [nftImage, setNftImage] = useState("");
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });

  const router = useRouter();
  const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

  const notify = (id, msg) =>
    toast(msg, {
      toastId: id,
      autoClose: false,
      type: toast.TYPE.INFO,
      closeButton: false,
      theme: "colored",
    });

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
      toast.error("Error uploading file", {
        theme: "colored",
      });
    }
  }

  // checks to make sure that the value is a number
  function is_Int(value) {
    return !isNaN(parseInt(value * 1));
  }

  // Update the form input state
  // Store the FILE metadata on IPFS
  async function createMarket() {
    const { name, description, price } = formInput;
    if (!name || !description || !price) {
      toast.error("Please fill in all fields", {
        theme: "colored",
      });
      return;
    }

    if (!is_Int(price)) {
      toast.error("Price must be a number", {
        theme: "colored",
      });
      return;
    }

    if (!fileUrl) {
      toast.error("Please select a file", {
        theme: "colored",
      });
      return;
    }

    // first, upload to IPFS
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });

    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      // after file is uploaded to IPFS, pass the URL to save it on Polygon
      createNFT(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
      toast.error("Error uploading file", {
        theme: "colored",
      });
    }
  }

  async function createNFT(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    let tokenId;
    let toastId;

    try {
      setIsTransacting(true);

      let nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);

      let transaction = await nftContract.createToken(url);

      toastId = "NFT";
      notify(toastId, "NFT creation in progress ...");

      // retreive the tokenId
      let tx = await transaction.wait();
      let event = tx.events[0];
      let value = event.args[2];
      tokenId = value.toNumber();

      // fetch image from IPFS
      const tokenUri = await nftContract.tokenURI(tokenId);
      const meta = await axios.get(tokenUri); // ipfs endpoint

      //Provide a link to the transaction on polyscan
      setNftImage(meta.data.image);
      setNftTxHash(transaction.hash);

      toast.update(toastId, {
        render: "NFT Successfully Created!",
        closeButton: null,
        type: toast.TYPE.SUCCESS,
        autoClose: 5000,
        theme: "colored",
      });

      listNFTOnMarket(tokenId);
    } catch (err) {
      console.log(err);
      setIsTransacting(false);
      const msg = err.message.split(":")[1];

      setTimeout(() => {
        toast.error(msg, {
          theme: "colored",
        });
      }, 500);
    }
  }

  async function listNFTOnMarket(tokenId) {
    let toastId;
    const price = ethers.utils.parseUnits(formInput.price, "ether");

    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

      toastId = "Market";
      notify(toastId, "Listing New Market Item ...");
      let listingPrice = await contract.getListingPrice();
      listingPrice = listingPrice.toString();

      const transaction = await contract.createMarketItem(
        nftaddress,
        tokenId,
        price,
        {
          value: listingPrice,
        }
      );

      //Provide a link to the transaction on polyscan
      setMarketTxHash(transaction.hash);
      setSuccessfulTransaction(true);

      toast.update(toastId, {
        render: "Market Item Successfully Added!",
        closeButton: null,
        type: toast.TYPE.SUCCESS,
        autoClose: 5000,
        theme: "colored",
      });
    } catch (err) {
      // show nft tx receipt
      setSuccessfulTransaction(true);

      const msg = err.message.split(":")[1];
      toast.update(toastId, {
        render: msg,
        closeButton: null,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
        theme: "colored",
      });
    }
  }

  return (
    <>
      <Head>
        <title>NFT Marketplace | Create</title>
      </Head>

      {successfulTransaction ? (
        // Transaction Hash
        <>
          <div className="flex flex-col p-4 mt-4 mx-4 border bg-white shadow-md hover:shodow-lg rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {" "}
                <Image
                  src="/matic-token-icon.webp"
                  alt="Matic Token Image"
                  width="30"
                  height="30"
                  objectFit="contain"
                />
                <div className="flex flex-col ml-3">
                  <>
                    <div className="leading-none font-bold pb-1 ">
                      Transaction Details. View on Polyscan:
                    </div>
                    <div>
                      Create NFT:{" "}
                      <Link
                        href={`https://mumbai.polygonscan.com/tx/${nftTxHash}`}
                        className="cursor-pointer hover:font-bold"
                      >
                        <a target="_blank" className="text-pink-500">
                          {nftTxHash}
                        </a>
                      </Link>
                    </div>

                    {marketTxHash && (
                      <div>
                        NFT Market Listing:{" "}
                        <Link
                          href={`https://mumbai.polygonscan.com/tx/${marketTxHash}`}
                          className="cursor-pointer "
                        >
                          <a target="_blank" className="text-pink-500">
                            {marketTxHash}
                          </a>
                        </Link>
                      </div>
                    )}
                  </>
                </div>
              </div>

              <button
                className="flex-no-shrink bg-red-500 px-5 ml-4 py-2 text-sm shadow-sm hover:shadow-lg font-medium tracking-wider border-2 border-red-500 text-white rounded-full"
                onClick={() => {
                  router.push("/");
                }}
              >
                FINISH
              </button>
            </div>
          </div>
          <div className="p-4">
            {successfulTransaction && (
              <>
                <ToastContainer
                  position="top-center"
                  pauseOnFocusLoss={false}
                />
                <div className=" flex justify-center mt-10 ">
                  <div className="px-4">
                    <div className="border shadow rounded-xl overflow-hidden ">
                      <Link href={nftImage} className="cursor-pointer ">
                        <a target="_blank">
                          <Image
                            src={nftImage}
                            alt="NFT"
                            width="350"
                            height="350"
                            objectFit="contain"
                          />
                        </a>
                      </Link>
                    </div>
                    <div className="mt-2  bg-pink-500 text-white font-bold py-2 px-12 rounded-xl">
                      Congratulations on creating an NFT!
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      ) : isTransacting ? (
        // Transaction Screen
        <div className="flex justify-center mt-10">
          <div className="w-1/2 flex flex-col pb-12 ">
            <h2 className="text-2xl py-2 text-center bg-gray-100   ">
              Transaction Process
            </h2>

            <ToastContainer position="top-center" pauseOnFocusLoss={false} />

            <div>
              <p className="font-light text-2xl border p-4 rounded my-4">
                <span className="font-bold">Step 1:</span> Create the NFT token
                and store it on the blockchain. Confirm the transaction on your
                wallet.
              </p>
              <p className="font-light text-2xl  border p-4 rounded my-4">
                <span className="font-bold">Step 2:</span> Wait for the
                transaction to be processed.
              </p>
              <p className="font-light text-2xl border p-4 rounded">
                <span className="font-bold">Step 3:</span> Allow Metaverse to
                sell the NFT. This comes with a small fee. Confirm the
                transaction on your wallet.
              </p>
              <p className="font-light text-2xl pt-1 border p-4 rounded my-4">
                <span className="font-bold">Step 4:</span> Wait for the
                transaction to be processed.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Create NFT Screen
        <div className="p-4">
          <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
              <h2 className="text-2xl py-2 text-center bg-gray-100 rounded ">
                Create Asset
              </h2>

              <ToastContainer position="top-center " pauseOnFocusLoss={false} />

              <input
                placeholder="Asset Name"
                className="mt-8 border rounded p-4"
                value={formInput.name ? formInput.name : ""}
                onChange={(e) =>
                  updateFormInput({ ...formInput, name: e.target.value })
                }
              />
              <textarea
                placeholder="Asset Description"
                className="mt-2 border rounded p-4"
                value={formInput.description ? formInput.description : ""}
                onChange={(e) =>
                  updateFormInput({ ...formInput, description: e.target.value })
                }
              />
              <input
                placeholder="Asset Price in Matic"
                className="mt-2 border rounded p-4"
                value={formInput.price ? formInput.price : ""}
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
      )}
    </>
  );
}
