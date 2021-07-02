const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const { Web3Provider } = require("@ethersproject/providers");
const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider);

/*
 *
 * TODO
 * fUSDCxAddress address of the token fUSDCx used by superfluid. Must be changed on KOVAN.
 * recipientAddress to send fUSDC. Should come from organisation address.
 * amount of fUSDC to transfer. Should come from input.
 * rateName to transfer amount. Can be: minute, hour, day, month.
 * 
 */
const fUSDCxAddress = '0x8aE68021f6170E5a766bE613cEA0d75236ECCa9a';
const recipientAddress = '0x2880627569ffA41965536CE20B0596009eDfA744';
const amount = '1';
const rateName = 'minute';

function rate(_rate) {

  switch(_rate) {
    case 'minute':
      return 60;
    case 'hour':
      return 60 * 60;
    case 'day':
      return 60 * 60 * 24;
    case 'month':
      return 60 * 60 * 24 * 30;
  }

}

function flowRate(_amount, _rate) {

  const amount = _amount + "0".repeat(18);
  return (amount / rate(_rate)).toString().split('.', 1)[0];

}

async function startTransfer() {

  const sf = new SuperfluidSDK.Framework({
    ethers: new Web3Provider(window.ethereum),
    tokens: ["fUSDC", "fUSDCx"]
  });

  await sf.initialize()

  const walletAddress = await window.ethereum.request({
    method: 'eth_requestAccounts',
    params: [
      {
        eth_accounts: {}
      }
    ]
  });

  const userWallet = walletAddress[0];
  const fUSDC = await sf.contracts.TestToken.at(sf.tokens.fUSDC.address);
  const fUSDCx = sf.tokens.fUSDCx;
  await fUSDC.mint(userWallet, web3.utils.toWei("0.001", "ether"), { from: userWallet })
  await fUSDC.approve(fUSDCx.address, "1"+"0".repeat(42), { from: userWallet });
  await fUSDCx.upgrade(web3.utils.toWei(amount, "ether"), { from: userWallet });

  const user = sf.user({
    address: userWallet,
    token: fUSDCxAddress
  });

  await user.flow({
    recipient: recipientAddress,
    flowRate: flowRate(amount, rateName)
  });

}

// startTransfer();

async function stopTransfer() {

  const sf = new SuperfluidSDK.Framework({
    ethers: new Web3Provider(window.ethereum),
    tokens: ["fUSDC", "fUSDCx"]
  });

  await sf.initialize()

  const walletAddress = await window.ethereum.request({
    method: 'eth_requestAccounts',
    params: [
      {
        eth_accounts: {}
      }
    ]
  });

  const userWallet = walletAddress[0];
  const user = sf.user({
    address: userWallet,
    token: fUSDCxAddress
  });

  await user.flow({
    recipient: recipientAddress,
    flowRate: '0'
  });

}

stopTransfer();