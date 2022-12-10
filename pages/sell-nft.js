import styles from "../styles/Home.module.css";
import { Form, useNotification, Button } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import nftAbi from "../constants/BasicNft.json";
import AntiqueMarketplaceAbi from "../constants/AntiqueMarketplace.json";
import networkMapping from "../constants/networkMapping.json";
import { useEffect, useState } from "react";
import Image from "next/image";
const { storeExampleNFT } = require("../utils/uploadToNftStorage");

export default function Home() {
  const { chainId, account, isWeb3Enabled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = networkMapping[chainString].AntiqueMarketplace[0];
  const dispatch = useNotification();
  const [proceeds, setProceeds] = useState("0");

  const { runContractFunction } = useWeb3Contract();

  async function approveAndList(data) {
    console.log("Approving...");
    // const image = data.data[0].inputResult;
    // const tokenId = data.data[1].inputResult;
    // const name = data.data[2].inputResult;
    // const description = data.data[3].inputResult;

    // const price = ethers.utils
    //   .parseUnits(data.data[4].inputResult, "ether")
    //   .toString();

    // var { url } = storeExampleNFT(image, name, description);
    // console.log(url);

    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils
      .parseUnits(data.data[2].inputResult, "ether")
      .toString();

    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId,
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

  async function setupUI() {
    const returnedProceeds = await runContractFunction({
      params: {
        abi: AntiqueMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds",
        params: {
          seller: account,
        },
      },
      onError: (error) => console.log(error),
    });
    if (returnedProceeds) {
      setProceeds(returnedProceeds.toString());
    }
  }
  async function IpfsUpload(data) {
    console.log("----------------------------------");
    console.log(data.files[0]);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      setupUI();
    }
  }, [proceeds, account, isWeb3Enabled, chainId]);

  return (
    <div className={styles.container}>
      <Form
        onSubmit={approveAndList}
        data={[
          {
            name: "NFT address",
            type: "text",
            inputWidth: "50%",
            value: "",
            key: "name",
          },
          {
            name: "token ID",
            type: "number",
            value: "",
            key: "description",
          },
          {
            name: "Price (in ETH)",
            type: "number",
            value: "",
            key: "price",
          },
        ]}
        id="Main Form"
      />
      {/* <Form
        onSubmit={approveAndList}
        data={[
          {
            name: "IPFS URL link",
            type: "text",
            inputWidth: "50%",
            value: "",
            key: "IPFSurl",
          },
          {
            name: "Token ID",
            type: "number",
            value: "",
            key: "tokenId",
          },
          {
            name: "Name",
            type: "text",
            value: "",
            key: "Name",
          },
          {
            name: "Discription",
            type: "text",
            value: "",
            key: "discription",
          },
          {
            name: "Price (in ETH)",
            type: "number",
            value: "",
            key: "price",
          },
        ]}
        id="Main Form"
      /> */}
      <div>Withdraw {proceeds} proceeds</div>
      {proceeds != "0" ? (
        <Button
          onClick={() => {
            runContractFunction({
              params: {
                abi: AntiqueMarketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "withdrawProceeds",
                params: {},
              },
              onError: (error) => console.log(error),
              onSuccess: handleWithdrawSuccess,
            });
          }}
          text="Withdraw"
          type="button"
        />
      ) : (
        <div>No proceeds detected</div>
      )}
    </div>
  );
}
