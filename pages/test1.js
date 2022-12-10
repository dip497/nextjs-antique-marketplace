import React, { useState } from "react";
import { NFTStorage } from "nft.storage";
import { Form, useNotification, Button } from "web3uikit";
import AntiqueNft from "../constants/AntiqueNft.json";
import AntiqueMarketplaceAbi from "../constants/AntiqueMarketplace.json";
import { ethers } from "ethers";
import networkMapping from "../constants/networkMapping.json";
import { useMoralis, useWeb3Contract } from "react-moralis";

const MintNFT = () => {
  const APIKEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweENCMGFjNTE1QjdERDU0MGY1RjIyRmJFRTY4OTVDMDg0QjM4ZTI2OUEiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2OTY3MTE1Mjc0NywibmFtZSI6ImFudGlxdWVfbWFya2V0cGxhY2UifQ.4rQ5vPv9en2wE4hHwTqY1C96q0Stb68cN8Z0gIyks-4";
  const { chainId, account, isWeb3Enabled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = networkMapping[chainString].AntiqueMarketplace[0];

  const nftContractAddress = "0x3ab576AE437d1211B7E2B732A96E84D00FB4E18f";
  const dispatch = useNotification();
  const { runContractFunction } = useWeb3Contract();

  const [errorMessage, setErrorMessage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState();
  const [imageView, setImageView] = useState();
  const [metaDataURL, setMetaDataURl] = useState();
  const [txURL, setTxURL] = useState();
  const [txStatus, setTxStatus] = useState();

  const handleFileUpload = (event) => {
    console.log("file is uploaded");
    setUploadedFile(event.target.files[0]);
    setTxStatus("");
    setImageView("");
    setMetaDataURl("");
    setTxURL("");
  };
  const mintNFTToken = async (event, uploadedFile) => {
    event.preventDefault();
    // await tokenCounter();
    //1. upload NFT content via NFT.storage
    const metaData = await uploadNFTContent(uploadedFile);
    //
    //2. Mint a NFT token on Harmony
    await sendTx(
      "ipfs/QmWwhFDc4DZWo8hQ1yNtF82yqbXu5ZuCuRwJeTssaXovSe?filename=Screenshot_20221121_021854.png"
    );

    await approveAndList();
  };

  const uploadNFTContent = async (inputFile) => {
    const nftStorage = new NFTStorage({ token: APIKEY });
    try {
      console.log(inputFile);

      setTxStatus("Uploading NFT to IPFS & Filecoin via NFT.storage.");
      const metaData = await nftStorage.store({
        name: "coin",
        description: "coin desc",
        image: inputFile,
      });

      setMetaDataURl(getIPFSGatewayURL(metaData.url));
      return metaData;
    } catch (error) {
      setErrorMessage("Could not save NFT to NFT.Storage - Aborted minting.");
      console.log(error);
    }
  };

  const tokenCounter = async (metadata) => {
    const tokencounterId = {
      abi: AntiqueNft,
      contractAddress: nftContractAddress,
      functionName: "getTokenCounter",
      params: {},
    };
    tokencountertemp = tokencounterId;
  };

  const sendTx = async (metadata) => {
    const mintnft = {
      abi: AntiqueNft,
      contractAddress: nftContractAddress,
      functionName: "mintNft",
      params: {
        token__URI: metadata,
      },
    };

    await runContractFunction({
      params: mintnft,
      onSuccess: handleMintSuccess,
      onError: (error) => console.log(error),
    });
  };

  async function handleMintSuccess(tx) {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "NFT Minting",
      title: "NFT Minted",
      position: "topR",
    });
  }

  const getIPFSGatewayURL = (ipfsURL) => {
    console.log(urlArray);
    let urlArray = ipfsURL.split("/");
    let ipfsGateWayURL = `https://${urlArray[2]}.ipfs.dweb.link/${urlArray[3]}`;
    return ipfsGateWayURL;
  };

  async function approveAndList(data) {
    console.log("Approving...");
    const price = ethers.utils.parseUnits("0.01", "ether").toString();

    const approveOptions = {
      abi: AntiqueNft,
      contractAddress: nftContractAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: 3,
      },
    };

    await runContractFunction({
      params: approveOptions,
      onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
      onError: (error) => {
        console.log(error);
      },
    });
  }

  async function handleApproveSuccess(nftAddress, tokenId, price) {
    console.log("Ok! Now time to list");
    const listOptions = {
      abi: AntiqueMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price,
      },
    };

    await runContractFunction({
      params: listOptions,
      onSuccess: handleListSuccess,
      onError: (error) => console.log(error),
    });
  }

  async function handleListSuccess(tx) {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "NFT listing",
      title: "NFT listed",
      position: "topR",
    });
  }

  const handleWithdrawSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Withdrawing proceeds",
      position: "topR",
    });
  };

  return (
    <div className="MintNFT">
      <form>
        <h3>Mint your NFT on Harmony & Filecoin/IPFS</h3>
        <input type="file" onChange={handleFileUpload}></input>
        <button onClick={(e) => mintNFTToken(e, uploadedFile)}>Mint NFT</button>
      </form>

      {errorMessage}
    </div>
  );
};
export default MintNFT;
