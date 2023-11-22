const Arch3 = require('@archwayhq/arch3.js');

const Blockchain = {
  chainId: "archway-1",
  chainName: "Archway",
  rpc: "https://rpc.mainnet.archway.io",
  stakeCurrency: {coinDenom: "ARCH",coinMinimalDenom: "aarch",coinDecimals: 6,},
  bech32Config: {bech32PrefixAccAddr: "archway",bech32PrefixAccPub: "archwaypub",bech32PrefixValAddr: "archwayvaloper",bech32PrefixValPub: "archwayvaloperpub",bech32PrefixConsAddr: "archwayvalcons",bech32PrefixConsPub: "archwayvalconspub"},
  currencies: [{coinDenom: "ARCH",coinMinimalDenom: "aarch",coinDecimals: 18,}],
  feeCurrencies: [{coinDenom: "ARCH",coinMinimalDenom: "aarch",coinDecimals: 18,gasPriceStep: {low: 0,average: 0.1,high: 0.2},}],
  features: ['cosmwasm']
};

// Keplr example
async function Client() {
  await window.keplr.experimentalSuggestChain(Blockchain);
  await window.keplr.enable(Blockchain.chainId);
  window.keplr.defaultOptions = {sign:{preferNoSetFee: true}};
  const signer = await window.getOfflineSignerAuto(Blockchain.chainId);
  const client = await Arch3.SigningArchwayClient.connectWithSigner(Blockchain.rpc, signer);
  return client;
}

export {
    Client
}