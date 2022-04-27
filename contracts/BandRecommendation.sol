// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";

// Let's make a message board on a blockchain that will store people's favorite band

contract BandRecommendation {
  uint256 totalRecommendations;
  uint256 private seed;

  // Events store information from transaction logs and they cannot be accesable from within contract.
  // These logs are stored on a blockchain and are accesable using address of the contract.

  event newRecommendation(address indexed sender, uint256 timestamp, string band);

  // Now we need a struct to store address of a person who made recommendation, a recommendation itself and a timestamp

  struct Recommendations {
    address sender;
    string band;
    uint256 timestamp;
  }

  Recommendations[] bands;

  // Creating a mapping that would connect an address with last time this address recommended a band
  mapping(address => uint256) public timeDelay;

  constructor() payable {
    console.log("Please recommended a band you think should be remembered in time?");

    seed = (block.timestamp + block.difficulty) % 100; // We are getting a number between 0 and 99 and use it as a third part of the actual seed
  }

  function recommend(string memory _band) public {

    require(
      timeDelay[msg.sender] + 60 seconds < block.timestamp,
      "Wait at least 1 minute"
    );

    timeDelay[msg.sender] = block.timestamp; // Updating timestamp for the current sender

    totalRecommendations += 1;

    // Storing the band and all other relevant information in an array;

    bands.push(Recommendations(msg.sender, _band, block.timestamp));
    console.log("%s has recommended %s!", msg.sender, _band);

    seed = (block.timestamp + block.difficulty + seed) % 100;
    console.log("Random number generated is: %s", seed);

    if (seed >= 50) {
      console.log("%s has won!", msg.sender);

      uint256 prizeAmount = 0.0001 ether;
      require(
        prizeAmount <= address(this).balance,
        "There are no more ETH left in smart contract"
      );
      (bool success, ) = (msg.sender).call{value: prizeAmount}("");
      require(success, "Failed to withdraw money from smart contract");
    }

    // Logging a band on a blockchain

    emit newRecommendation(msg.sender, block.timestamp, _band);

    // Giving 0.0001ETH back to everyone who recommends a band


  }

  function getAllRecommendations() public view returns (Recommendations[] memory) {
    return bands;
  }

  function getTotalRecommendations() public view returns (uint256) {
    console.log("We have %d total recommendations: ", totalRecommendations);
    return totalRecommendations;
  }
}
