import Onboard from 'bnc-onboard'

const ethers = require("ethers");
const easABI = require("../EASabi.json");

const blockNativeAPIKey = '0822d008-0624-4b0f-a5d5-24aac01cdd72';
const networkID = 4;
const zero = "0x0000000000000000000000000000000000000000";
const easAddress = "0xBf49E19254DF70328C6696135958C94CD6cd0430";
const messageUUID =
  "0xa082b0a64557fd912265053a2bf90213dc3813f26ba3d116122b3ee30d5f6f9d";
const usernameUUID =
  "0x1a1aac09dcf87a6662ca6f7cfda6cf8ab0d7e2b6fc4afcde3112480a36c563b1";
let usernameCache = [];
const RPC_URL = 'https://rinkeby.infura.io/v3/7beca79f4be84480b5557a579b1016dc';

let provider;
let easContract

export const onboard = Onboard({
  dappId: blockNativeAPIKey,       // [String] The API key created by step one above
  networkId: networkID,  // [Integer] The Ethereum network ID your Dapp uses.
  subscriptions: {
    wallet: wallet => {
      provider = new ethers.providers.Web3Provider(wallet.provider);
      easContract = new ethers.Contract(easAddress, easABI, provider);
    },
  }
});

export async function getBalance(address) {
  return await provider.getBalance(address);
}

export async function setUsername(username) {
  const signer = provider.getSigner();
  const easContractSign = new ethers.Contract(easAddress, easABI, signer);
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ['bytes32'],
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

export async function postMessage(message) {
  const signer = provider.getSigner();
  const easContractSign = new ethers.Contract(easAddress, easABI, signer);
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ['bytes'],
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
  } catch(e) {
    return null;
  }
}

export async function getTweets() {
  const attestations = await easContract.getSchemaAttestationUUIDs(
    messageUUID,
    0,
    100,
    true
  );
  const attestationPromises = attestations.map((attestation) =>
    easContract.getAttestation(attestation)
  );
  const resolved = await Promise.all(attestationPromises);

  let messages = [];

  for (let attestation of resolved) {
    try {
      const decoded = ethers.utils.defaultAbiCoder.decode(
        ["bytes"],
        attestation.data
      );

      const message = ethers.utils.toUtf8String(decoded[0]);

      messages.push({
        username: await getUsername(attestation.attester),
        from: attestation.attester,
        time: attestation.time.toString(),
        message,
      });
    } catch (e) {
      console.log('Failed to decode attestation', attestation);
    }

  }


  return messages;
}
