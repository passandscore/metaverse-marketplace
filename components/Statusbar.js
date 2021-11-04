const StatusBar = ({ status }) => {
  return (
    <div>
      {status && (
        <div className="flex justify-center items-center p-3 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
          <span id="status">{status}</span>
        </div>
      )}
    </div>
  );
};

export default StatusBar;
