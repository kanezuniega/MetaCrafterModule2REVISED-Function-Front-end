# FUNCTION FRONT-END

This NodeJS program demonstrates an ETH ATM using MetaMask Wallet.

## Description

This code is a React component for a webpage that interacts with the Ethereum blockchain using the MetaMask wallet and the ethers.js library. The component allows users to connect their MetaMask wallet, view their account balance, and perform actions such as depositing, withdrawing, and transferring Ether. It also interacts with a deployed smart contract.

## Executing the program 
To run this program, you need to clone it to your computer/laptop. I also provided a snippet of my code if you want to re-write and practice it.

```javascript
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const borrow = async () => {
    if (atm) {
      try {
        let tx = await atm.borrow(1);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Borrow transaction failed:", error);
      }
    }
  };

  const transfer = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to transfer ETH');
      return;
    }

    const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Example recipient address
    const amountInEther = "1"; // Amount to transfer

    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();

    try {
      // Send Ether to the recipient
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.utils.parseEther(amountInEther)
      });
      await tx.wait();
      console.log("Transaction successful:", tx);

      // Call the contract's transfer function to update the contract's balance
      let contractTx = await atm.transfer(recipientAddress, ethers.utils.parseEther(amountInEther));
      await contractTx.wait();
      console.log("Transfer function executed successfully:", contractTx);

      getBalance();
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const logout = () => {
    setAccount(undefined);
    setATM(undefined);
    setBalance(undefined);
    console.log("Account disconnected");
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <button onClick={borrow}>Borrow 1 ETH</button>
        <button onClick={transfer}>Transfer 1 ETH</button>
        <button onClick={logout}>Logout Metamask ATM</button>
      </div>
    );
  };

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  );
}
```
You also need to download the MetaMask wallet extension since you'll need to create a test network. After downloading MetaMask Wallet, proceed to: 
1) SETTING
2) NETWORKS
3) ADD NETWORK MANUALLY
4) Copy and paste the following:
Network name: localhost 3000
New RPC URL: http://127.0.0.1:8545/
Chain ID: 31337
Currency Symbol: ETH 
***DISREGARD THE WARNING TICKER SYMBOL DATA IS CURRENTLY UNAVAILABLE***
Press OK.
After you've done this part, proceed to the bottom of this README file.

## FUNCTIONS 
1) Deposit - add 1 ETH to your account 
2) Withdraw - withdraw 1 ETH from your account
3) Borrow - Borrow 1 ETH from the ATM
4) Transfer - Transfer 1 ETH to another account
5) Logout - logout your MetaMask account from the ATM.
## Authors

ZUNIEGA, Kane Nathaniel O.
## FEU INSTITUTE OF TECHNOLOGY


## License
This project is licensed under the MIT License - see the LICENSE.md file for details


# Starter Next/Hardhat Project

After cloning the github, you will want to do the following to get the code running on your computer.

1. Inside the project directory, in the terminal type: npm i
2. Open two additional terminals in your VS code
3. In the second terminal type: npx hardhat node (get the private key and import it to your MetaMask Wallet)
4. In the third terminal, type: npx hardhat run --network localhost scripts/deploy.js
5. Back in the first terminal, type npm run dev to launch the front-end.

After this, the project will be running on your localhost. 
Typically at http://localhost:3000/

***DO NOT FORGET TO CHANGE YOUR NETWORK INSIDE METAMASK. USE LOCALHOST3000***
