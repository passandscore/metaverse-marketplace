const StatusBar = ({ status }) => {
  return (
    <div>
      {status && (
        <div className="flex  text-2xl justify-center items-center p-5 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
          <span id="status">{status}</span>
        </div>
      )}
    </div>
  );
};

export default StatusBar;
