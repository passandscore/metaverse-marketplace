import "../styles/globals.css";
import Link from "next/link";

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

function Marketplace({ Component, pageProps }) {
  const [wallet, setWallet] = useState({ wallet: "", balance: 0, network: "" });

  useEffect(() => {
    loadWalletDetails();
  }, []);

  async function loadWalletDetails() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const accounts = await provider.listAccounts();
    const balance = await provider.getBalance(accounts[0]);
    balance = Number(ethers.utils.formatEther(balance)).toFixed(2);
    const network = await provider.getNetwork();

    setWallet({
      wallet: accounts[0],
      balance: balance,
      network: network.name,
    });
    console.log(wallet);
  }

  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">Metaverse Marketplace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-pink-500">Home</a>
          </Link>
          <Link href="/create-item">
            <a className="mr-6 text-pink-500">Sell Digital Asset</a>
          </Link>
          <Link href="/my-assets">
            <a className="mr-6 text-pink-500">My Digital Assets</a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-pink-500">Creator Dashboard</a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default Marketplace;
