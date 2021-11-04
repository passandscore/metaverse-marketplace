import Link from "next/link";

export const getNetworkName = async () => {
  let chainId = await window.ethereum.networkVersion;

  switch (chainId) {
    case "1":
      chainId = "mainnet";
      break;
    case "42":
      chainId = "kovan";
      break;
    case "3":
      chainId = "Ropsten";
      break;
    case "4":
      chainId = "Rinkeby";
      break;
    case "5":
      chainId = "Goerli";
      break;
    case "1337":
      chainId = "Mumbai";
      break;

    default:
      break;
  }

  return chainId;
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const obj = {
        status: "",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
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
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
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
      ),
    };
  }
};
