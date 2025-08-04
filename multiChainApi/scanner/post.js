const axios = require('axios');

async function main() {
  try {
    const response = await axios.post("http://localhost:3737/simulate", {
      contractAddress: "0x07ef2F8eC9E98c853ab9D0B9f6D150A215069C2d", // token contract address
      chain: "eth", // chain identifier from your chains.js
      ownerAddress: "0xC8CFb00ddF4732A8e487CEe90BE35D077b5aE2f4", // owner holding tokens
      tokenSymbol: "TOKENTESTL", // token symbol (for logging)
      decimals: 18           // token decimals (e.g., 4 instead of 18)
    });
    console.log("Simulation Report:", response.data);
  } catch (error) {
    console.error("Error occurred:", error.response ? error.response.data : error.message);
  }
}

main();
