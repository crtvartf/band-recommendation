import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './index.css';
import abi from './utils/BandRecommendation.json';
import useLocalStorage from 'use-local-storage';


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0xFC493A6334e667f3dDc53Bac7D78a2c70FA533bb";
  const contractABI = abi.abi;
  const [allRecommendations, setAllRecommendations] = useState([]);
  const [bandName, setBandName] = useState("");
  
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
  
  const handleChange = (event) => {
    setBandName(event.target.value);
  }
  
  const recommend = async (bandName) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bandContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await bandContract.getTotalRecommendations();
        console.log("Retrieved total number of recommendations...", count.toNumber());

        // Getting the band name and writing it on a blockchain

        const bandTxn = await bandContract.recommend(bandName, { gasLimit: 300000 });
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

  // Creating a method to extract all recommendations from blockchain

  const getAllRecommendations = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bandContract = new ethers.Contract(contractAddress, BandRecommendation.abi, signer);

        // Calling "getAllRecommendations" method from smart contract
        
        const bands = await bandContract.getAllRecommendations();

        // We need only clean data (address, readable timestamp and message)
        
        const bandsCleaned = bands.map((recommend) => {
          return {
            address: recommend.sender,
            timestamp: new Date(recommend.timestamp * 1000),
            message: recommend.band,
          };
        });

        // Storing required data in React State
        
        setAllRecommendations(bandsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  useEffect(() => {
    checkIfWalletIsConnected();
    let bandContract;
  
    const onNewRecommendation = (sender, timestamp, band) => {
      console.log("newRecommendation", sender, timestamp, band);
      setAllRecommendation((prevState) => [
        ...prevState,
        {
          address: sender,
          timestamp: new Date(timestamp * 1000),
          message: band
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      bandContract = new ethers.Contract(contractAddress, contractABI, signer);
      bandContract.on("newRecommendation", onNewRecommendation);
    }

    return () => {
      if (bandContract) {
        bandContract.off("newRecommendation", onNewRecommendation);
      }
    }
  }, []);
  
  const [theme, setTheme] = useLocalStorage('theme' ? 'dark': 'light');
  
  const switchTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme)
  }
  
  return (
    
    <div className="app" data-theme={theme}>
      
      <header>
        <div className="theme-toggle">
          <i onClick={switchTheme} className='fas fa-toggle-on'></i>
        </div>
        <div>
          {!currentAccount && (
            <button onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
        
      </header>

      <div className="greetings">
        🤘 Hey there!
      </div>
      
      <div className="dataContainer">

        <div className="container">
          Music makes our life better. Name a band that you think deserves to be remembered.
        </div>

        <input
          type="text"
          placeholder="Band name"
          onChange={handleChange}
          required 
        />
        
        <button onClick={() => recommend(bandName)}>
          Recommend
        </button>
      </div>
      
      <div className="dataContainer">
        {allRecommendations.map((bands, index) => {
        return (
          <div key={index}>
              <div>Address: {recommend.sender}</div>
              <div>Time: {recommend.timestamp.toString()}</div>
              <div>Message: {recommend.band}</div>
          </div>
          );
        })}
      </div>
      
    </div>
  );
}

export default App
