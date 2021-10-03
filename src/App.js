import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import myEpicNft from "./utils/MyEpicNFT.json";

const CONTRACT_ADDRESS = "0xb540D8953b104c9C8b5DD2285b2D540BAA0F18dd";
const TWITTER_HANDLE = "dieumondroit";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}`;
const TOTAL_MINT_COUNT = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [openSeaLink, setOpenSeaLink] = useState("");
  const [isWrongNetwork, setWrongNetwork] = useState(false);
  const [mintedAmount, setMintedAmount] = useState(0);
  const [minting, setMinting] = useState(false);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (ethereum.networkVersion !== "4") {
      setWrongNetwork(true);
    }

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener();
      getCount();
    } else {
      console.log("No authorized account found");
    }
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          const link = `${OPENSEA_LINK}/${tokenId.toNumber()}`;
          setOpenSeaLink(link);
          setMintedAmount(tokenId.toNumber() + 1);
          console.log(from, tokenId.toNumber(), link);
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCount = async () => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer
      );
      const count = await connectedContract.getAmountMinted();
      setMintedAmount(count.toNumber());
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
      getCount();

      const handleChange = (_chainId) => {
        setWrongNetwork(_chainId !== "0x4");
      };
      if (ethereum) {
        ethereum.on("chainChanged", handleChange);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setMinting(true);
        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        setMinting(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setMinting(false);
      console.log(error);
    }
  };

  useEffect(() => {
    const { ethereum } = window;

    const handleChange = (_chainId) => {
      setWrongNetwork(_chainId !== "0x4");
    };
    if (ethereum) {
      ethereum.on("chainChanged", handleChange);
    }
    checkIfWalletIsConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      {isWrongNetwork && (
        <div style={{ width: "100%", background: "#a200d6" }}>
          <p
            className="sub-text"
            style={{ fontSize: 14, margin: 0, padding: "4px 0" }}
          >
            Hey, just want to inform you that you are connected to the wrong
            network, please change to the Rinkeby network
          </p>
        </div>
      )}
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <p className="sub-text">
            <span
              style={{ color: "#ff00c8" }}
            >{`${mintedAmount} out of ${TOTAL_MINT_COUNT}`}</span>{" "}
            has already been minted
          </p>
          {currentAccount === "" ? (
            <button
              onClick={connectWallet}
              className="cta-button connect-wallet-button"
            >
              Connect to Wallet
            </button>
          ) : (
            <>
              <button
                onClick={askContractToMintNft}
                className="cta-button connect-wallet-button"
                disabled={minting}
              >
                {minting ? "Minting your NFT" : "Mint NFT"}
              </button>
              {openSeaLink.length > 0 && (
                <a target="_blank" rel="noreferrer" href={openSeaLink}>
                  <button
                    style={{
                      marginLeft: 15,
                    }}
                    className="cta-button mint-button"
                  >
                    See your newly minted NFT
                  </button>
                </a>
              )}
            </>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
