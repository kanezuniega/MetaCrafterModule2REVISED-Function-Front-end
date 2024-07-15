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
