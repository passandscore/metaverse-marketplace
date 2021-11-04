const ConnectButton = ({
  metamaskInstalled,
  connectWalletPressed,
  walletAddress,
}) => {
  return (
    <div>
      {metamaskInstalled && (
        <button
          id="walletButton"
          onClick={connectWalletPressed}
          className="btn btn-link  p-2 rounded-md border-2 border-pink-500 hover:bg-pink-500 px-4 text-pink-500 hover:text-white"
        >
          {walletAddress.length > 0 ? (
            "Connected: " +
            String(walletAddress).substring(0, 6) +
            "..." +
            String(walletAddress).substring(38)
          ) : (
            <span>Connect Wallet</span>
          )}
        </button>
      )}
    </div>
  );
};

export default ConnectButton;
