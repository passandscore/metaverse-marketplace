import Link from "next/link";

export const getNetworkName = async () => {
  if (window.ethereum) {
    let chainId = await window.ethereum.networkVersion;

    switch (chainId) {
      case "1":
        chainId = "Wrong Network";
        break;
      case "42":
        chainId = "Wrong Network";
        break;
      case "3":
        chainId = "Wrong Network";
        break;
      case "4":
        chainId = "Wrong Network";
        break;
      case "5":
        chainId = "Wrong Network";
        break;
      case "1337":
        chainId = "Local Host";
        break;
      case "80001":
        chainId = "Mumbai";
        break;

      default:
        break;
    }

    return chainId;
  }
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const status = maticDetails();
      const obj = {
        status: status.tokens,
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
        const status = maticDetails();
        return {
          address: addressArray[0],
          status: status.tokens,
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
              className=" ml-5 btn btn-link font-light p-1 rounded-md border border-white  px-4 text-white hover:border-purple-500"
            >
              Download
            </a>
          </Link>
        </p>
      ),
    };
  }
};

export const maticDetails = () => {
  return {
    tokens: (
      <div className="md:flex ">
        <div className=" m-2 border rounded-xl p-2 text-center  hover:border-purple-500">
          <Link href="https://polygon.technology/">
            <a
              target="_blank"
              className="text-white font-light  text-center px-2"
            >
              Polygon Docs
            </a>
          </Link>
        </div>

        <div className="  m-2 border rounded-xl p-2 text-center  hover:border-purple-500">
          <Link href="https://mumbai.polygonscan.com">
            <a target="_blank" className="text-white font-light px-2">
              Mumbai Block Explorer
            </a>
          </Link>
        </div>

        <div className=" m-2 border rounded-xl p-2 text-center  hover:border-purple-500">
          <Link href="https://faucet.polygon.technology/">
            <a target="_blank" className="text-white font-light px-2">
              Mumbai Test Tokens
            </a>
          </Link>
        </div>

        <div className="  m-2 border rounded-xl p-2 text-center  hover:border-purple-500">
          <Link href="https://docs.polygon.technology/docs/develop/network-details/network">
            <a target="_blank" className="text-white font-light px-2">
              Mumbai Network Setup
            </a>
          </Link>
        </div>
      </div>
    ),
  };
};
