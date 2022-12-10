import { Modal, Input, useNotification, Typography } from "web3uikit";
import { useState } from "react";
import { useWeb3Contract } from "react-moralis";
import AntiqueMarketplaceAbi from "../constants/AntiqueMarketplace.json";
import { ethers } from "ethers";
import NFTBox from "./NFTBox";

export default function UpdateListingModal({
  nftAddress,
  tokenId,
  isVisible,
  marketplaceAddress,
  onClose,
}) {
  const dispatch = useNotification();

  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);

  const handleUpdateListingSuccess = () => {
    dispatch({
      type: "success",
      message: "listing updated",
      title: "Listing updated - please refresh (and move blocks)",
      position: "topR",
    });
    onClose && onClose();
    setPriceToUpdateListingWith("0");
  };

  const { runContractFunction: updateListing } = useWeb3Contract({
    abi: AntiqueMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "updatedListing",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
      newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
    },
  });

  return (
    <Modal
      isVisible={isVisible}
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() => {
        updateListing({
          onError: (error) => {
            console.log(error);
          },
          onSuccess: () => handleUpdateListingSuccess(),
        });
      }}
      title={
        <div style={{ display: "flex", gap: 10, fontSize: 28 }}>
          <Typography color="#68738D" variant="h3">
            Update Price
          </Typography>
        </div>
      }
    >
      <div
        style={{
          padding: "20px 0 20px 0",
        }}
      >
        <Input
          label="Update listing price in L1 Currency (ETH)"
          name="New listing price"
          type="number"
          onChange={(event) => {
            setPriceToUpdateListingWith(event.target.value);
          }}
        />
      </div>
    </Modal>
  );
}
