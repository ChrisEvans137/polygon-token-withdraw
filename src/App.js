import React, { useEffect, useState } from "react";
import Web3 from "web3";

import Navbar from "./components/Navbar";
import WalletConnectProvider from "@maticnetwork/walletconnect-provider";

import config from "./utils/config.json";
const MaticPoSClient = require("@maticnetwork/maticjs").MaticPOSClient;

const App = () => {
  const [Networkid, setNetworkid] = useState(0);
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [maticProvider, setMaticProvider] = useState();
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');

  // init web3 metamask
  useEffect(() => {
    loadBlockchainData();
  }, []);
  const loadBlockchainData = async () => {
    try {
      setLoading(true);
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.alert(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }

      // matic provider set
      const maticProvider = await new WalletConnectProvider({
        host: config.MATIC_RPC,
        callbacks: {
          onConnect: console.log("matic connected"),
          onDisconnect: console.log("matic disconnected!"),
        },
      });
      setMaticProvider(maticProvider);

      // set web3
      const web3 = await window.web3;
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      const networkId = await web3.eth.net.getId();
      setNetworkid(networkId);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(e.message.substr(0, 80));
      console.error(e);
    }
  };

  // posClientGeneral facilitates the operations like approve, deposit, exit
  const posClientParent = () => {
    const maticPoSClient = new MaticPoSClient({
      network: config.NETWORK,
      version: config.VERSION,
      maticProvider: maticProvider,
      parentProvider: window.web3,
      parentDefaultOptions: { from: account },
      maticDefaultOptions: { from: account },
    });
    return maticPoSClient;
  };
  // POS ERC20 exit function
  const exitERC20 = async () => {
    setError('');
    setHash('');
    try {
      setLoading(true);
      const maticPoSClient = posClientParent();
      const isDone = await maticPoSClient.isERC20ExitProcessed(inputValue);
      console.log(isDone);
      if (isDone) {
        setLoading(false);
        console.log("EXIT ALREADY PROCESSED");
        setError('Withdraw process completed already.');
        return;
      }
      await maticPoSClient
        .exitERC20(inputValue, {
          from: account,
        })
        .then((res) => {
          console.log("Exit transaction hash: ", res);
          setHash(res.transactionHash);
          setLoading(false);
        });
    } catch (e) {
      setLoading(false);
      if (e.message.substr(0, 28) === `Returned values aren't valid`)
        setError('Make sure you are on Eth Network')
      else if (e.message === `Cannot read property 'blockNumber' of null`)
        setError('Incorrect burn transaction hash')
      else if (e.message.substr(0, 32) === `Returned error: invalid argument`)
        setError('Incorrect burn transaction hash')
      else if (e.message.substr(0, 49) === `Burn transaction has not been checkpointed as yet`)
        setError('Burn transaction has not been checkpointed yet. Please wait for 1-3hrs.')
      else if (e.message.substr(0, 53) === `Invalid parameters: must provide an Ethereum address.`)
        setError('Please refresh the page and try again.')
      else setError(e.message.substr(0, 80));
      console.error(e);
    }
  };


  return (
    <React.Fragment>
      <Navbar account={account} setAccount={setAccount} />
      <main style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>

        <div className="input-group">
          <span className="input-group-text">Tx Hash</span>
          <input type="text" className="form-control" placeholder="0xaa30bf8f73dfdaa..." name="inputValue"
            value={inputValue} onChange={(e) => setInputValue(e.target.value)} required
          />
        </div>
        <br />

        {loading ?
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          :
          <button className="btn btn-dark ms-2" onClick={exitERC20}
            disabled={Networkid === config.ETHEREUM_CHAINID ? false : true}>
            Complete Withdraw
          </button>
        }

        {hash &&
          <div className="alert alert-success text-break mt-3" role="alert">
            Exit transaction hash: <a target="_blank" href={`https://etherscan.io/tx/${hash}`} rel="noreferrer">{hash}</a>
          </div>
        }

        {error &&
          <div className="alert alert-danger text-break mt-3" role="alert">
            {error}
          </div>
        }

        <div className="alert alert-info text-break mt-5" role="alert">
          <h2>What it does ?</h2>
          <br />
          <p class="text-start">
            <a target="_blank" style={{ color: '#0d6efd', textDecoration: 'underline' }}
              href="https://github.com/ChrisEvans137/polygon-token-withdraw" rel="noreferrer">Open Souce GitHub Link</a>
          </p>
          <p class="text-start">
            This is a very simple interface that will allow you to complete your withdraw process which you started on Polygon Network.
            In case you have initiated your withdraw on the Polygon chain and you are not able to complete the final step of withdraw on
            Ethereum, then you can use this interface.
          </p>

          <h2>How to use ?</h2>
          <ul style={{ textAlign: 'left' }}>
            <li>This application can be only used by MetaMask broswer extenstion.</li>
            <li>This application can be used to withdraw all ERC20 tokens except MATIC.</li>
            <li>Ensure that you are on Ethereum Network before going ahead with the steps below.</li>
            <li>Go to <a target="_blank" style={{ color: '#0d6efd', textDecoration: 'underline' }} href={`https://polygonscan.com/address/${account}#tokentxns`} rel="noreferrer">this link</a>
              {' '} and look for the transaction with which you initiated the first step of withdraw process on Polygon chain.</li>
            <li>Paste the transaction hash of that transaction in the input box.</li>
            <li>Click on Complete Withdraw and wait for the Metamask to popup.</li>
            <li>Confirm the transaction. Its reccomended not to lower the gas fees or the gas limit.</li>
            <li>Once the transaction gets completed, you will see a link to the transaction details on Ethereum. Do not refresh the screen.</li>
            <li>Thats it. Your tokens will be safely withdrawn to your account on Ethereum.</li>
            <li>Note: In case you speeded up the ethereum transaction, the tx will not shown on UI.</li>
          </ul>
        </div>
      </main>
    </React.Fragment>
  );
};

export default App;
