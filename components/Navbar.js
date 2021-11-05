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
          <ul className="flex border-b">
            <li className="-mb-px mr-1 ">
              <Link href="/">
                <a className="bg-white inline-block  py-2 px-4 text-pink-500 font-semibold hover:text-purple-500  ">
                  Home
                </a>
              </Link>
            </li>
            <li className="mr-1">
              <Link href="/create-item">
                <a className="bg-white inline-block py-2 px-4 text-pink-500 hover:text-purple-500 font-semibold">
                  Sell Digital Asset
                </a>
              </Link>
            </li>
            <li className="mr-1">
              <Link href="/my-assets">
                <a className="bg-white inline-block py-2 px-4 text-pink-500 hover:text-purple-500 font-semibold">
                  My Digital Assets
                </a>
              </Link>
            </li>

            <li className="mr-1">
              <Link href="/creator-dashboard">
                <a className="bg-white inline-block py-2 px-4 text-pink-500 font-semibold hover:text-purple-500">
                  Creator Dashboard
                </a>
              </Link>
            </li>
          </ul>
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
