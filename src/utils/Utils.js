import { recoverTypedSignature_v4 } from "eth-sig-util";
import axios from "axios";
import Onboard from "bnc-onboard";

const graphAPIUrl = "https://api.studio.thegraph.com/query/4717/easter/v0.6.32";
const ethers = require("ethers");
const easABI = require("../abis/EASabi.json");

const verifierABI = require("../abis/verifierABI.json");
const blockNativeAPIKey = "0822d008-0624-4b0f-a5d5-24aac01cdd72";
export const EASVersion = "0.6"; // Rinkeby
export const CHAINID = 4;
const zeroAddress = "0x0000000000000000000000000000000000000000";

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
  return (await provider)
    ? provider?.getBalance(address)
    : ethers.constants.Zero;
}

export async function setUsername(username) {
  const signer = provider.getSigner();
  const easContractSign = new ethers.Contract(easAddress, easABI, signer);
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["bytes32"],
    [ethers.utils.formatBytes32String(username)]
  );
  const params = [
    zeroAddress,
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

export async function postMessage(message, refUUID) {
  const signer = provider.getSigner();
  const easContractSign = new ethers.Contract(easAddress, easABI, signer);
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["bytes"],
    [ethers.utils.toUtf8Bytes(message)]
  );
  const params = [
    zeroAddress,
    messageUUID,
    ethers.constants.MaxUint256,
    refUUID ? refUUID : ethers.constants.HashZero,
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
    recipient: zeroAddress,
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

export async function getUsernameGraph(address) {
  const result = await axios.post(graphAPIUrl, {
    query: `{

  user(id: "${address}") {
    usernameData
  }
}`,
  });

  return result.data.data.user
    ? decodeUsername(result.data.data.user.usernameData)
    : null;
}

function decodeUsername(data) {
  try {
    const decoded = ethers.utils.defaultAbiCoder.decode(["bytes32"], data);
    return ethers.utils.parseBytes32String(decoded[0]);
  } catch (e) {
    return null;
  }
}

function decodeTweetData(data) {
  try {
    const decoded = ethers.utils.defaultAbiCoder.decode(["bytes"], data);
    return ethers.utils.toUtf8String(decoded[0]);
  } catch (e) {
    return "Error decoding message.";
  }
}

export function navigateToAddress(address) {
  document.location = `/#/address/${address}`;
}

export function formatGraphMessages(unformattedMessages) {
  return unformattedMessages.map((message) => ({
    uuid: message.id,
    from: message.attester,
    time: message.time,
    rawData: message.data,
    refUUID: message.refUUID,
    message: decodeTweetData(message.data),
    username: message.user ? decodeUsername(message.user.usernameData) : null,
    relatedMessages: message.relatedMessages,
  }));
}

export async function getTweetsFromAddress(address) {
  const result = await axios.post(graphAPIUrl, {
    query: `{
  messages(first: 100, orderDirection: desc, orderBy: time, where: {revoked:false, attester: "${address}",refUUIDString: "${ethers.constants.HashZero}"}) {
    relatedMessages(where: {revoked:false}, orderDirection: desc, orderBy: time) {
      attester
      id
      data
      time
      relatedMessages(where: {revoked:false}, orderDirection: desc, orderBy: time) {
        attester
        id
        data
        time
        user {
          usernameData
        }
      }
      user {
        usernameData
      }
    }
    refUUID {
      id
    }
    id
    data
    recipient
    time
    attester
    user {
      usernameData
    }
  }
 
}`,
  });

  return formatGraphMessages(result.data.data.messages);
}

export async function getTweets() {
  const result = await axios.post(graphAPIUrl, {
    query: `{
  messages(first: 100, orderDirection: desc, orderBy: time, where: {revoked:false, refUUIDString: "${ethers.constants.HashZero}"}) {
    relatedMessages(where: {revoked:false}, orderDirection: desc, orderBy: time) {
      attester
      id
      data
      relatedMessages(where: {revoked:false}, orderDirection: desc, orderBy: time) {
        attester
        id
        data
        time
        user {
          usernameData
        }
      }
      time
      user {
        usernameData
      }
    }
    refUUID {
      id
    }
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
  });

  return formatGraphMessages(result.data.data.messages);
}

export function navigateToEtherscanAddress(address) {
  window.open(`${etherscanURL}/address/${address}`, "_blank");
}
