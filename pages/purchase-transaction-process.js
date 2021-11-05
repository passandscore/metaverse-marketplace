// https://reactjs.org/docs/getting-started.html

import Image from "next/Image";
import Head from "next/head";

export default function CreateItem() {
  return (
    <>
      <Head>
        <title>NFT Marketplace | Purchase</title>
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
                <span className="font-bold">Step 1:</span> Purchase NFT from the
                seller. Confirm the transaction on your wallet.
              </p>
              <p className="font-light text-2xl">
                {" "}
                <span className="font-bold">Step 2:</span> Wait for the
                transaction to be mined.
              </p>

              <br />
              <p className="font-light text-2xl text-center">
                You will be redirected to the Homepage upon completion
              </p>
            </div>
          </div>
        </div>
      </div>
      <div></div>
    </>
  );
}
