import React from "react";
import { Dialog } from "./Dialog";
import { ethers } from "ethers";

import {
  navigateToEtherscanAddress,
} from "../utils/Utils";

import dayjs from "dayjs";
import {darkBlue} from "../utils/colors";

export default function AttestationDialog({
  attestationData,
  onClose,
}) {


  const styles = {
    container: {},
    address: {
      fontFamily: "Roboto Mono",
      textOverflow: "wrap",
      whiteSpace: "pre-wrap",
      overflowWrap: "break-word",
      cursor: 'pointer'
    },
    title: {
      fontWeight: 600,
      fontSize: 14,
    },
    value: {
      marginBottom: 8,
      fontSize: 14,
      color: darkBlue,
    },
  };


  const {
    schema,
    recipient,
    attester,
    time,
    expirationTime,
    revocationTime,
    data,
    refUUID,
    uuid,
  } = attestationData;

  const timeDayJS = dayjs.unix(ethers.BigNumber.from(time));
  const expirationTimeJS = dayjs.unix(ethers.BigNumber.from(expirationTime));
  const revocationTimeJS = dayjs.unix(ethers.BigNumber.from(revocationTime));
  const expirationStr = expirationTimeJS.format("MMM-MM-YYYY hh:MM:ss A");
  return (
    <Dialog
      isVisible={true}
      width={600}
      body={
        <div style={styles.container}>
          <div>
            <div style={styles.title}>Attestation UUID:</div>
            <div style={{ ...styles.value, ...styles.address }}>{uuid}</div>

            <div style={styles.title}>Schema UUID: </div>
            <div style={{ ...styles.value, ...styles.address }}>{schema}</div>

            {/*<div style={styles.title}>Ethereum Transaction ID:</div>*/}
            {/*<div style={{ ...styles.value, ...styles.address }}>{txid}</div>*/}

            <div style={styles.title}>From:</div>
            <div
              style={{ ...styles.value, ...styles.address }}
              onClick={() => navigateToEtherscanAddress(attester)}
            >
              {attester}
            </div>

            <div style={styles.title}>To:</div>
            <div
              style={{ ...styles.value, ...styles.address }}
              onClick={() => navigateToEtherscanAddress(recipient)}
            >
              {recipient}
            </div>

            <div style={styles.title}>Timestamp:</div>
            <div style={{ ...styles.value }}>
              {dayjs().to(timeDayJS)} (
              {timeDayJS.format("MMM-MM-YYYY hh:MM:ss A")})
            </div>

            <div style={styles.title}>Expiration Time:</div>
            <div style={{ ...styles.value }}>
              {" "}
              {ethers.BigNumber.from(expirationTime).toString() ===
              ethers.constants.MaxUint256.toString()
                ? "Never"
                : expirationStr}
            </div>

            <div style={styles.title}>Referenced Attestation UUID:</div>
            <div style={{ ...styles.value, ...styles.address }}>{refUUID}</div>

            <div style={styles.title}>Data:</div>
            <div style={{ ...styles.value, ...styles.address }}>{data}</div>


          </div>
        </div>
      }
      title={"Attestation details"}
      onClose={onClose}
    />
  );
}
