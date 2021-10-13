const { providers, utils, bcs } = require('@starcoin/starcoin');
const { arrayify, hexlify } = require('@ethersproject/bytes');
const sleep = require('sleep');

// const nodeURL = "https://main-seed.starcoin.org"
// const chainId = 1; // main network
const nodeURL = "https://barnard-seed.starcoin.org"
const chainId = 251; // barnard network

const provider = new providers.JsonRpcProvider(nodeURL);

const senderPrivateKeyHex = '0x...';
const senderAddressHex = '0x...';

const receivers = [
  ['0x179274b3f1017015d928be82c25d0943', 10000],
  ['0xc4800d2c0c24ac6e068010fadacd2d5e', 20000],
  ['0xd2e034de283397ce825130de9abb56e7', 30000],
]

submitTxn()

async function submitTxn() {

    const senderSequenceNumber = await provider.getSequenceNumber(
      senderAddressHex
    );
    console.log({senderSequenceNumber});

    const maxGasAmount = 10000000;
    const gasUnitPrice = 1

    const functionId = '0x1::TransferScripts::peer_to_peer_v2'
    const typeArgs = ['0x1::STC::STC']

    for (let i=0;i < receivers.length;i++) {
        const args = [
            receivers[i][0],
            receivers[i][1],
        ]
        const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, typeArgs, args, nodeURL);

        const nowSeconds = await provider.getNowSeconds();
        const expirationTimestampSecs = nowSeconds + 60;

        const rawUserTransaction = utils.tx.generateRawUserTransaction(
          senderAddressHex,
          scriptFunction,
          maxGasAmount,
          gasUnitPrice,
          senderSequenceNumber+i,
          expirationTimestampSecs,
          chainId
        );

        const signedUserTransactionHex = await utils.tx.signRawUserTransaction(
          senderPrivateKeyHex,
          rawUserTransaction
        );

        console.log({signedUserTransactionHex});

        const txn = await provider.sendTransaction(signedUserTransactionHex);
        console.log({txn})

        sleep.sleep(2);

        console.log('Transfer submitted: ', (i+1), receivers[i][0], receivers[i][1])

        // const txnInfo = await txn.wait(1);
        // console.log({txnInfo});
    }
}
