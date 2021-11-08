import Link from "next/link";
import Navbar from "../components/Navbar";
import StatusBar from "../components/Statusbar";

import { useEffect, useState } from "react";
import {
  connectWallet,
  getCurrentWalletConnected,
  getNetworkName,
  maticDetails,
} from "../utils/interact.js";

const Layout = ({ children }) => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [chainId, setChainId] = useState("");
  const [metamaskInstalled, setMetamaskInstalled] = useState(false);

  useEffect(() => {
    async function getWallet() {
      const { address, status } = await getCurrentWalletConnected();

      setWallet(address);
      setStatus(status);
      const networkName = await getNetworkName();
      setChainId(networkName);
      addWalletListener();
    }

    getWallet();
  }, []);

  function addWalletListener() {
    if (window.ethereum) {
      setMetamaskInstalled(true);

      window.ethereum.on("chainChanged", async () => {
        const networkName = await getNetworkName();
        setChainId(networkName);
        window.location.reload();
      });

      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          const status = maticDetails();
          setStatus(status.tokens);
          window.location.reload();
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
          window.location.reload();
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
    <div className="main-container">
      <Navbar
        metamaskInstalled={metamaskInstalled}
        connectWallet={connectWallet}
        walletAddress={walletAddress}
        connectWalletPressed={connectWalletPressed}
        chainId={chainId}
      />
      <StatusBar status={status} />
      {children}
    </div>
  );
};

export default Layout;
