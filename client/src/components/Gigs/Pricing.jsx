import React, { useEffect, useState } from "react";
import { FiClock, FiRefreshCcw } from "react-icons/fi";
import { BiRightArrowAlt } from "react-icons/bi";
import { BsCheckLg } from "react-icons/bs";
import { useStateProvider } from "../../context/StateContext";
import { useRouter } from "next/router";
import { useStateProviderBlock } from "../../context/StateContext_Block";
import { ethers } from "ethers";
import Escrow from "../../abis/Escrow.json";

function Pricing() {
  const [{ gigData, userInfo }, dispatch] = useStateProvider();
  const router = useRouter();
  console.log(userInfo);

  //Blockchain
  const [freelancer, setFreelancer] = useState("");
  let [escrowContract, setEscrowContract] = useState(null);
  const [isrequestSent, setIsRequestSent] = useState(false);
  const [escrowAddress, setEscrowAddress] = useState("");
  const [isDeposit, setIsDeposit] = useState(false);
  const [isWorkReceived, setIsWorkRecieved] = useState(false);
  const projectAmount = 200;
  const client = "0x297Fc005eb3dd5A108C2969806c418A298881f53";
  const submissionDeadline = 10;
  // const arbiter = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
  const arbiter = "0xeE206C66bA18253f04B35e8f8cBC2AA86f9e01aC";
  const { state } = useStateProviderBlock();
  const currentAddress = state.currentAddress;
  const signer = state.signer;
  const freelanceContractAddress = state.freelanceContractAddress;
  const freelanceTokenContract = state.freelanceTokenContract;
  console.log(freelancer);

  const storeObject = (key, object) => {
    localStorage.setItem(key, JSON.stringify(object));
  };

  const fetchObject = (key) => {
    const storedObject = localStorage.getItem(key);
    return storedObject ? JSON.parse(storedObject) : null;
  };

  const createEscrowContract = async () => {
    try {
      const EscrowFactory = new ethers.ContractFactory(
        Escrow.abi,
        Escrow.bytecode,
        signer
      );

      const escrowContract = await EscrowFactory.deploy(
        client,
        freelancer,
        arbiter,
        freelanceContractAddress,
        submissionDeadline
      );
      console.log(escrowContract);

      storeObject("Escrowcontract", escrowContract);
      console.log("Freelancer address set in contract:", freelancer);

      const escrowAddress = await escrowContract.getAddress();
      setEscrowAddress(escrowAddress);

      console.log("Escrow address : ", escrowAddress);
      alert("Escrow contract deployed successfully");
    } catch (error) {
      console.error("Error deploying escrow contract:", error);
    }
  };

  console.log("freelanceContractAddress", freelanceContractAddress);
  console.log("escrowContract", escrowContract);
  console.log("client", client);

  const deposit = async (amount) => {
    setEscrowContract(fetchObject("Escrowcontract"));
    console.log("This escrow contract from localhost", escrowContract);
    try {
      if (freelanceTokenContract && escrowContract && currentAddress) {
        const tx = await freelanceTokenContract.approve(
          escrowAddress,
          ethers.parseEther(amount.toString())
        );
        await tx.wait();
        const depositTx = await escrowContract.deposit(
          ethers.parseEther(amount.toString())
        );
        await depositTx.wait();
        setIsWorkRecieved(true);
      } else {
        alert("Only the client can deposit funds.");
      }
    } catch (error) {
      console.error("Error during deposit:", error);
    }
  };

  const submitWork = async (fileUrl) => {
    console.log("escrowContract: ", escrowContract);
    try {
      if (escrowContract && currentAddress === freelancer) {
        const tx = await escrowContract.submitWork(fileUrl);
        await tx.wait();
        setFileUrl(fileUrl);
      } else {
        alert("Only the freelancer can submit work.");
      }
    } catch (error) {
      console.error("Error during work submission:", error);
    }
  };

  const handleRequest = async () => {
    setFreelancer(currentAddress);
    await createEscrowContract();
    setIsDeposit(true);
  };

  const handleDeposit = () => {
    deposit(projectAmount);
  };

  const hanldeRequestSent = () => {
    setIsRequestSent(true);
    alert("Request sent successfully");
  };

  useEffect(() => {
    setFreelancer(currentAddress);
  });

  return (
    <>
      {gigData && (
        <div className="sticky top-36 mb-10 h-max w-96">
          <div className="border p-10 flex flex-col gap-5">
            <div className="flex justify-between">
              <h4 className="text-md font-normal text-[#74767e]">
                {gigData.shortDesc}
              </h4>
              <h6 className="font-medium text-lg">${gigData.price}</h6>
            </div>
            <div>
              <div className="text-[#62646a] font-semibold text-sm flex gap-6">
                <div className="flex items-center gap-2">
                  <FiClock className="text-xl" />
                  <span>{gigData.deliveryTime} Days Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiRefreshCcw className="text-xl" />
                  <span>{gigData.revisions} Revisions</span>
                </div>
              </div>
              <ul></ul>
            </div>
            <ul className="flex gap-1 flex-col">
              {gigData.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <BsCheckLg className="text-[#1DBF73] text-lg" />
                  <span className="text-[#4f5156]">{feature}</span>
                </li>
              ))}
            </ul>
            {gigData.userId === userInfo.id ? (
              <div className="flex flex-col gap-5 w-full">
                <button
                  className="flex items-center bg-[#1DBF73] text-white py-2 justify-center font-bold text-lg relative rounded"
                  onClick={() => router.push(`/freelancer/gigs/${gigData.id}`)}
                >
                  <span>Edit</span>
                  <BiRightArrowAlt className="text-2xl absolute right-4" />
                </button>
                {
                  <span>
                    Request from: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266{" "}
                  </span>
                }

                {
                  <button
                    onClick={handleRequest}
                    className="flex items-center bg-[#1DBF73] text-white py-2 justify-center font-bold text-lg relative rounded"
                  >
                    <span>Approve</span>
                    <BiRightArrowAlt className="text-2xl absolute right-4" />
                  </button>
                }

                {isDeposit && (
                  <button
                    onClick={handleDeposit}
                    className="flex items-center bg-[#1DBF73] text-white py-2 justify-center font-bold text-lg relative rounded"
                  >
                    <span>Deposit</span>
                    <BiRightArrowAlt className="text-2xl absolute right-4" />
                  </button>
                )}

                {isWorkReceived && (
                  <button
                    onClick={handleDeposit}
                    className="flex items-center bg-[#1DBF73] text-white py-2 justify-center font-bold text-lg relative rounded"
                  >
                    <span>Work Received</span>
                    <BiRightArrowAlt className="text-2xl absolute right-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col">
                <button
                  className="flex items-center bg-[#1DBF73] text-white py-2 justify-center font-bold text-lg relative rounded"
                  onClick={hanldeRequestSent}
                >
                  {isrequestSent ? (
                    <span>Request Sent</span>
                  ) : (
                    <span>Send Request</span>
                  )}
                  <BiRightArrowAlt className="text-2xl absolute right-4" />
                </button>
                <div className="mt-4 mb-4 flex h-[50px]">
                <input
                  type="text"
                  className="border p-3 border-black  rounded-lg"
                  id="fileUrl"
                  placeholder="File URL"
                />
                <button
                  className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800  font-medium  text-lg px-10 py-3 rounded-md ml-4"
                  onClick={() =>
                    submitWork(document.getElementById("fileUrl").value)
                  }
                >
                  Submit
                </button>
              </div>
              </div>
            )}
            
          </div>
          
          {gigData.userId !== userInfo.id && (
            <div className="flex items-center justify-center mt-5">
              <button className=" w-5/6 hover:bg-[#74767e] py-1 border border-[#74767e] px-5 text-[#6c6d75] hover:text-white transition-all duration-300 text-lg rounded font-bold">
                Contact Me
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Pricing;
