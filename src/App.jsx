import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/BandRecommendation.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  /**
   * Create a varaible here that holds the contract address after you deploy!
   */
  const contractAddress = "0xddFef2C227214730e82aB97802C2Be066F4cd3e9";
  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const recommend = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bandContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await bandContract.getTotalRecommendations();
        console.log("Retrieved total number of recommendations...", count.toNumber());

        const bandTxn = await bandContract.recommend();
        console.log("Mining...", bandTxn.hash);

        await bandTxn.wait();
        console.log("Mined -- ", bandTxn.hash);

        count = await bandContract.getTotalRecommendations();
        console.log("Retrieved total number of recommendations...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          Music makes our life better. Name a band that you think deserves to be remembered.
        </div>
        
        <button className="bandButton" onClick={recommend}>
          Name a band
        </button>

        {!currentAccount && (
          <button className="bandButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

export default App
