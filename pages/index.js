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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadedNfts, setLoadedNfts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [isTransacting, setIsTransacting] = useState(false);
  const [successfulTransaction, setSuccessfulTransaction] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [nftImage, setNftImage] = useState("");

  const notify = (id, msg) =>
    toast(msg, {
      toastId: id,
      autoClose: false,
      type: toast.TYPE.INFO,
      closeButton: false,
      theme: "colored",
    });

  const update = (id, msg) => {
    toast.update(id, {
      render: msg,
      closeButton: null,
      type: toast.TYPE.SUCCESS,
      autoClose: 5000,
      theme: "colored",
    });
  };

  useEffect(() => {
    loadNFTs();

    addWalletListener();
  }, []);

  async function addWalletListener() {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        setIsConnected(true);
        setAddress(addressArray[0]);
      }

      if (window.ethereum) {
        window.ethereum.on("accountsChanged", (accounts) => {
          accounts.length > 0 ? setIsConnected(true) : setIsConnected(false);
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function loadNFTs() {
    // Using a generic provider as we don't need to know anything about the user. (READ ONLY) Changed when connected to a testnet
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
    setLoadedNfts(true);
    setIsLoading(false);
  }

  async function nftOwner(itemId) {
    console.log("owner");
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

    const data = await marketContract.fetchMarketItems();

    let result = await Promise.all(
      data.map(async (nft) => {
        if (
          nft.itemId.toNumber() === itemId &&
          nft.seller.toLowerCase() === address
        ) {
          return nft.seller.toLowerCase();
        }
      })
    );

    result = result.filter((e) => e !== undefined).length;
    return result;
  }

  async function buyNft(nft) {
    const isOwner = await nftOwner(nft.itemId);
    if (isOwner) {
      const msg = "You cannot purchase an NFT that you created";
      toast.error(msg, { theme: "colored" });
      return;
    }

    //Navigate the user to the transaction page
    setIsTransacting(true);

    try {
      // Look for new ethereum instance injected by into the browser
      const web3Modal = new Web3Modal();

      // Connect to that instance
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);

      // Get the user's wallet information
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );

      // Format the price
      const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

      // Construct the transaction
      const transaction = await contract.createMarketSale(
        nftaddress,
        nft.itemId,
        {
          value: price,
        }
      );
      const toastId = "Purchase";
      notify(toastId, "Purchasing Market Item ...");

      await transaction.wait();

      //Provide a link to the transaction on polyscan
      setNftImage(nft.image);
      setTxHash(transaction.hash);
      setSuccessfulTransaction(true);

      update(toastId, "Market Item Successfully Purchased!");
    } catch (err) {
      setIsTransacting(false);

      setTimeout(() => {
        const msg = err.message.split(":")[1];
        console.log(msg);
        toast.error(msg, { theme: "colored" });
      }, 500);
    }
  }

  if (loadedNfts && !nfts.length)
    return (
      <>
        <Head>
          <title>NFT Marketplace | Home</title>
        </Head>
        <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;
      </>
    );

  return (
    <>
      <Head>
        <title>NFT Marketplace | Home</title>
      </Head>

      <ToastContainer position="top-center" pauseOnFocusLoss={false} />

      {isLoading ? (
        <div className="flex justify-center mt-20">
          <Image
            src={"/loading-spinner.gif"}
            alt="Loader"
            width="200"
            height="200"
          />
        </div>
      ) : successfulTransaction ? (
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
                  <div className="font-medium leading-none pb-1 ">
                    Transaction Details. View on Polyscan:
                  </div>

                  <div>
                    Purchase NFT:{" "}
                    <Link
                      href={`https://mumbai.polygonscan.com/tx/${txHash}`}
                      className="cursor-pointer "
                    >
                      <a target="_blank" className="text-pink-500">
                        {txHash}
                      </a>
                    </Link>
                  </div>
                </div>
              </div>

              <button
                className="flex-no-shrink bg-red-500 px-5 ml-4 py-2 text-sm shadow-sm hover:shadow-lg font-medium tracking-wider border-2 border-red-500 text-white rounded-full"
                onClick={() => {
                  setIsTransacting(false);
                  setSuccessfulTransaction(false);
                  loadNFTs();
                }}
              >
                Finish
              </button>
            </div>
          </div>
          <div className="p-4">
            {successfulTransaction && (
              <>
                <div className="flex justify-center mt-10 ">
                  <div className="px-4">
                    <div
                      className="border shadow rounded-xl overflow-hidden "
                      style={{ maxWidth: "350px" }}
                    >
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
                    <div className="mt-2 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded-xl">
                      Congratulations on your purchase!
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      ) : isTransacting ? (
        // Transaction Screen
        <div className="flex justify-center mt-10 ">
          <div className="w-1/2 flex flex-col pb-12 ">
            <h2 className="text-2xl py-2 text-center bg-gray-100  ">
              Transaction Process
            </h2>

            <div>
              <p className="font-light text-2xl border p-4 rounded my-4">
                <span className="font-bold">Step 1:</span> Purchase NFT from the
                seller. Confirm the transaction on your wallet.
              </p>
              <p className="font-light text-2xl border p-4 rounded ">
                <span className="font-bold">Step 2:</span> Wait for the
                transaction to be processed.
              </p>
            </div>
            <br />
          </div>
        </div>
      ) : (
        // Home Page
        <div className="flex justify-center ">
          <div className="px-4 " style={{ maxWidth: "1600px" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 mt-8 ">
              {nfts.map((nft, i) => (
                <div
                  key={i}
                  className="border  rounded-xl overflow-hidden hover:shadow-xl  "
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
      )}
    </>
  );
}
