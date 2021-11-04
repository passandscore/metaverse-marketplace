import Link from "next/link";
import ConnectButton from "./ConnectButton";
import NetworkButton from "./NetworkButton";

const Navbar = ({
  metamaskInstalled,
  connectWalletPressed,
  walletAddress,
  chainId,
}) => {
  return (
    <nav className="border-b p-6">
      <p className="text-4xl font-bold">Metaverse Marketplace</p>
      <div className="flex mt-4 justify-between items-center">
        <div className="flex ">
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

        <div className="flex">
          <NetworkButton
            metamaskInstalled={metamaskInstalled}
            walletAddress={walletAddress}
            chainId={chainId}
          ></NetworkButton>
          <ConnectButton
            metamaskInstalled={metamaskInstalled}
            connectWalletPressed={connectWalletPressed}
            walletAddress={walletAddress}
          ></ConnectButton>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
