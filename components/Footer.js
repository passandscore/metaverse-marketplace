import Link from "next/link";

const Footer = () => {
  return (
    <div className="flex border-t justify-center items-center  pt-2">
      <h4 className="text-2xl">The Matic token is required to purchase.</h4>
      <div className="  flex text-2xl  p-5">
        <span>
          <Link href="https://faucet.polygon.technology/">
            <a
              target="_blank"
              className="btn btn-link  p-1 rounded-md border-2 border-pink-500 hover:bg-pink-500 px-4 text-pink-500 hover:text-white"
            >
              Get Mumbai Test Tokens
            </a>
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Footer;
