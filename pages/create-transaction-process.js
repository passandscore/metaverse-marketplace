// https://reactjs.org/docs/getting-started.html

import Image from "next/Image";
import Head from "next/head";
import Router from "next/router";

function handleClick() {
  Router.push("/");
}

export default function CreateItem() {
  return (
    <>
      <Head>
        <title>NFT Marketplace | Create</title>
      </Head>

      <div className="p-4">
        <div className="flex justify-center ">
          <div className="w-1/2 flex flex-col pb-12 ">
            <h2 className="text-2xl py-2 text-center bg-gray-100  ">
              Transaction In Process{" "}
            </h2>
            <Image
              src="/loading-spinner.gif"
              alt="Matic Token Image"
              width="100"
              height="100"
              objectFit="contain"
            />
            <div className="border p-4 rounded">
              <p className="text-2xl text-center">
                There are a few more steps to complete.
              </p>
              <br />
              <p className="font-light text-2xl">
                <span className="font-bold">Step 1:</span> Mint the NFT to your
                wallet. Confirm the transaction on your wallet.
              </p>
              <p className="font-light text-2xl">
                {" "}
                <span className="font-bold">Step 2:</span> Wait for the
                transaction to be mined.
              </p>
              <p className="font-light text-2xl">
                <span className="font-bold">Step 3:</span> Allow Metaverse to
                sell the NFT. This comes with a small fee. Confirm the
                transaction on your wallet.
              </p>
              <p className="font-light text-2xl ">
                {" "}
                <span className="font-bold">Step 4:</span> Wait for the
                transaction to be mined.
              </p>

              <br />
              <p className="font-light text-2xl text-center">
                You will be redirected to the Homepage upon completion
              </p>
            </div>

            <button
              className="btn btn-link  mt-10 p-2 rounded-md border-2 border-pink-500 bg-pink-500 px-4 text-white cursor-default cursor-pointer"
              onClick={handleClick}
            >
              Cancel Transaction
            </button>
          </div>
        </div>
      </div>
      <div></div>
    </>
  );
}
