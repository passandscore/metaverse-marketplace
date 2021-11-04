import Link from "next/link";
import Navbar from "../components/Navbar";
import StatusBar from "../components/Statusbar";

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { connectWallet, getCurrentWalletConnected } from "../utils/interact.js";

const Layout = ({ children }) => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [metamaskInstalled, setMetamaskInstalled] = useState(false);

  useEffect(() => {
    async function getWallet() {
      const { address, status } = await getCurrentWalletConnected();

      setWallet(address);
      setStatus(status);

      addWalletListener();
    }

    getWallet();
  }, [metamaskInstalled]);

  function addWalletListener() {
    if (window.ethereum) {
      setMetamaskInstalled(true);

      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setMetamaskInstalled(false);

      setStatus(
        <p>
          {" "}
          🦊 You must install Metamask, a virtual Ethereum wallet, in your
          browser.{" "}
          <Link
            href="https://metamask.io/download.html"
            className=" ml-5 btn btn-link  p-1 rounded-md border-2 border-white hover:bg-white px-4 text-white hover:text-black"
          >
            <a
              target="_blank"
              className=" ml-5 btn btn-link  p-1 rounded-md border-2 border-white hover:bg-white px-4 text-white hover:text-black"
            >
              Download
            </a>
          </Link>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  return (
    <>
      <Navbar
        metamaskInstalled={metamaskInstalled}
        connectWallet={connectWallet}
        walletAddress={walletAddress}
        connectWalletPressed={connectWalletPressed}
      />
      <StatusBar status={status} />
      {children}
    </>
  );
};

export default Layout;
