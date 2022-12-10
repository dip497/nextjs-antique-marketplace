import { NFTStorage } from "nft.storage";

// read the API key from an environment variable. You'll need to set this before running the example!
const API_KEY = process.env.NFT_STORAGE_API;

async function storeExampleNFT(ipfs, name, description) {
  const nft = {
    ipfs, // use image Blob as `image` field
    name,
    description,
  };

  const client = new NFTStorage({ token: API_KEY });
  const metadata = await client.store(nft);

  console.log("NFT data stored!");
  console.log("Metadata URI: ", metadata.url);
  return metadata.url;
}

module.exports = {
  storeExampleNFT,
};
