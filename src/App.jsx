import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './index.css';
import abi from './utils/BandRecommendation.json';
import useLocalStorage from 'use-local-storage';


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  // Create a varaible here that holds the contract address after you deploy!
  
  const contractAddress = "0xa0DAeB94dFa7AeFA91aa52259b2D8066B74DF256";
  const contractABI = abi.abi;
  const [allBands, setAllBands] = useState([]);

  // Creating a method to extract all recommendations from blockchain

  const getAllBands = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider
        const signer = provider.getSigner();
        const bandContract = new ethers.Contract(contractAddress, BandRecommendation.abi, signer);

        // Calling "getAllBands" method from smart contract
        
        const bands = await bandContract.getAllBands();

        // We need only clean data (address, readable timestamp and message)
        
        let bandsCleared = [];
        bands.forEach(recommend => {
          bandsCleared.push({
            address: recommend.sender,
            timestamp: new Date(recommend.timestamp * 1000),
            message: recommend.message
          });
        });

        // Storing required data in React State
        
        setAllBands(bandsCleared);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
  
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
        // await getAllBands();
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
      // await getAllBands();
    } catch (error) {
      console.log(error)
    }
  }

  const [bandName, setBandName] = useState("");
  
  const handleChange = (event) => {
    setBandName(event.target.value);
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

        // Getting the band name and writing it on a blockchain

        const bandTxn = await bandContract.recommend(bandName);
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

  const [theme, setTheme] = useLocalStorage('theme' ? 'dark': 'light');
  
  const switchTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme)
  }
  
  return (
    
    <div className="app" data-theme={theme}>
      <header>
        
      </header>
      <div className="dataContainer">
        <div className="greetings">
        🤘 Hey there!
        </div>

        <div className="container">
          Music makes our life better. Name a band that you think deserves to be remembered.
        </div>

        <input
          type="text"
          placeholder="Band name"
          onChange={handleChange}
          required 
        />
        
        <button onClick={recommend}>
          Recommend
        </button>

        {!currentAccount && (
          <button onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        
      </div>
      <div className="theme-toggle">
        <h2>Dark Theme</h2>
        <i onClick={switchTheme} className='fas fa-toggle-on'></i>
      </div>
      
    </div>
  );
}

export default App
