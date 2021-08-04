import { recoverTypedSignature_v4 } from "eth-sig-util";
import axios from "axios";
import Onboard from "bnc-onboard";

const ethers = require("ethers");
const easABI = require("../abis/EASabi.json");

const verifierABI = require("../abis/verifierABI.json");
const blockNativeAPIKey = "0822d008-0624-4b0f-a5d5-24aac01cdd72";
export const EASVersion = "0.6"; // Rinkeby
export const CHAINID = 4;
const zero = "0x0000000000000000000000000000000000000000";
const easAddress = "0xBf49E19254DF70328C6696135958C94CD6cd0430";
export const EAS712Address = "0xa05e3Ca02C8437E99018E55cC3920FD79f4FD624"; // Rinkeby
const messageUUID =
  "0xa082b0a64557fd912265053a2bf90213dc3813f26ba3d116122b3ee30d5f6f9d";
const usernameUUID =
  "0x1a1aac09dcf87a6662ca6f7cfda6cf8ab0d7e2b6fc4afcde3112480a36c563b1";
let usernameCache = [];
const RPC_URL = "https://rinkeby.infura.io/v3/7beca79f4be84480b5557a579b1016dc";
export const etherscanURL = "https://rinkeby.etherscan.io";

let provider;
let easContract;

const { Delegation } = require("@ethereum-attestation-service/sdk");

const delegation = new Delegation({
  address: EAS712Address,
  version: EASVersion,
  chainId: CHAINID,
});

export const onboard = Onboard({
  dappId: blockNativeAPIKey, // [String] The API key created by step one above
  networkId: CHAINID, // [Integer] The Ethereum network ID your Dapp uses.
  subscriptions: {
    wallet: (wallet) => {
      provider = new ethers.providers.Web3Provider(wallet.provider);
      easContract = new ethers.Contract(easAddress, easABI, provider);
    },
  },
});

export async function getBalance(address) {
  return await provider.getBalance(address);
}

export async function setUsername(username) {
  const signer = provider.getSigner();
  const easContractSign = new ethers.Contract(easAddress, easABI, signer);
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["bytes32"],
    [ethers.utils.formatBytes32String(username)]
  );
  const params = [
    zero,
    usernameUUID,
    ethers.constants.MaxUint256,
    ethers.constants.HashZero,
    encoded,
  ];

  return await easContractSign.attest.apply(null, params);
}

export async function revokeMessage(uuid) {
  const signer = provider.getSigner();
  const easContractSign = new ethers.Contract(easAddress, easABI, signer);

  return await easContractSign.revoke(uuid);
}

export async function postMessage(message) {
  const signer = provider.getSigner();
  const easContractSign = new ethers.Contract(easAddress, easABI, signer);
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["bytes"],
    [ethers.utils.toUtf8Bytes(message)]
  );
  const params = [
    zero,
    messageUUID,
    ethers.constants.MaxUint256,
    ethers.constants.HashZero,
    encoded,
  ];

  const tx = await easContractSign.attest.apply(null, params);

  return tx;
}

export async function getVerifierNonce(address) {
  const contract = new ethers.Contract(EAS712Address, verifierABI, provider);
  return (await contract.getNonce(address)).toString();
}

function sendAsyncPromise(method) {
  return new Promise((resolve, reject) => {
    provider.provider.sendAsync(method, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export async function testProxyAttestation(signedObj) {
  try {
    const easContract = new ethers.Contract(easAddress, easABI, provider);
    await easContract.estimateGas.attestByDelegation(
      signedObj.recipient,
      signedObj.schema,
      signedObj.expirationTime,
      signedObj.refUUID,
      signedObj.data,
      signedObj.attester,
      signedObj.v,
      signedObj.r,
      signedObj.s
    );

    return true;
  } catch (e) {
    return false;
  }
}

export async function verifyProxyAttestation(req, signingAddress) {
  const { joinSignature, hexlify } = ethers.utils;

  return await delegation.verifyAttestationTypedDataRequest(
    signingAddress,
    req,
    async (data, signature) => {
      return recoverTypedSignature_v4({
        data,
        sig: joinSignature({
          v: signature.v,
          r: hexlify(signature.r),
          s: hexlify(signature.s),
        }),
      });
    }
  );
}

export async function makeProxyAttestation(params) {
  const signingAddress = window.ethereum.selectedAddress;
  const sign = async (message) => {
    const res = await sendAsyncPromise({
      method: "eth_signTypedData_v4",
      params: [signingAddress, message],
      from: signingAddress,
    });
    return res.result;
  };

  return await delegation.getAttestationTypedDataRequest(
    params,
    async (data) => {
      const { v, r, s } = ethers.utils.splitSignature(
        await sign(JSON.stringify(data))
      );
      return { v, r, s };
    }
  );
}

export async function postMessage712(message) {
  const signingAddress = window.ethereum.selectedAddress;
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["bytes"],
    [ethers.utils.toUtf8Bytes(message)]
  );

  // Attest by delegation
  const proxyParams = {
    recipient: zero,
    schema: messageUUID,
    expirationTime: ethers.constants.MaxUint256.toString(),
    refUUID: ethers.constants.HashZero,
    data: encoded,
    nonce: await getVerifierNonce(signingAddress),
  };

  const result = await makeProxyAttestation(proxyParams);

  return {
    attester: signingAddress,
    ...result,
  };
}

export async function getUsername(address) {
  if (usernameCache[address]) {
    return usernameCache[address];
  }

  try {
    const attestations = await easContract.getSentAttestationUUIDs(
      address,
      usernameUUID,
      0,
      1,
      true
    );

    if (!attestations.length) {
      return null;
    }

    const nameAttestation = await easContract.getAttestation(attestations[0]);
    const decoded = ethers.utils.defaultAbiCoder.decode(
      ["bytes32"],
      nameAttestation.data
    );
    const username = ethers.utils.parseBytes32String(decoded[0]);
    usernameCache[address] = username;

    return username;
  } catch (e) {
    return null;
  }
}

function decodeUsername(data) {
  const decoded = ethers.utils.defaultAbiCoder.decode(["bytes32"], data);
  return ethers.utils.parseBytes32String(decoded[0]);
}

function decodeTweetData(data) {
  const decoded = ethers.utils.defaultAbiCoder.decode(["bytes"], data);

  return ethers.utils.toUtf8String(decoded[0]);
}

export function navigateToAddress(address) {
  document.location = `/#/address/${address}`;
}

function formatGraphMessages(result) {
  return result.data.data.messages.map((message) => ({
    uuid: message.id,
    from: message.attester,
    time: message.time,
    rawData: message.data,
    message: decodeTweetData(message.data),
    username: message.user ? decodeUsername(message.user.usernameData) : null,
  }));
}

export async function getTweetsFromAddress(address) {
  console.log("aa", ethers.utils.getAddress(address));
  const result = await axios.post(
    "https://api.studio.thegraph.com/query/4717/easter/v0.6.29",
    {
      query: `{
  messages(first: 100, orderDirection: desc, orderBy: time, where: {revoked:false, attester: "${address}"}) {
    id
    data
    recipient
    time
    attester
    user {
      usernameData
    }
  }
 
}

`,
    }
  );

  return formatGraphMessages(result);
}

export async function getTweets() {
  const result = await axios.post(
    "https://api.studio.thegraph.com/query/4717/easter/v0.6.29",
    {
      query: `{
  messages(first: 100, orderDirection: desc, orderBy: time, where: {revoked:false}) {
    id
    data
    recipient
    time
    attester
    user {
      usernameData
    }
  }
 
}
`,
    }
  );

  return formatGraphMessages(result);
}

export function navigateToEtherscanAddress(address) {
  window.open(`${etherscanURL}/address/${address}`, "_blank");
}
