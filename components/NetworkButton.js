const NetworkButton = ({ metamaskInstalled, walletAddress, chainId }) => {
  return (
    <div>
      {walletAddress && (
        <button className="btn btn-link  p-2 rounded-md border-2 border-pink-500 bg-pink-500 px-4 text-white cursor-default">
          <span>{`Network: ${chainId}`}</span>
        </button>
      )}
    </div>
  );
};

export default NetworkButton;
