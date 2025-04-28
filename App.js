import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import RealEstateTransaction from './RealEstateTransaction.json'; // ABI JSON

const CONTRACT_ADDRESS = '0x1ea3F55C63E73aE75E7C8bf5F6B2e9517B1aa4e9'; // <-- Replace this!

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [properties, setProperties] = useState([]);
  
  const [newProperty, setNewProperty] = useState({ id: '', name: '', price: '' });
  const [transfer, setTransfer] = useState({ propertyId: '', newOwner: '', payment: '' });

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        const tempSigner = tempProvider.getSigner();
        const tempContract = new ethers.Contract(CONTRACT_ADDRESS, RealEstateTransaction.abi, tempSigner);
        const accounts = await tempProvider.send('eth_requestAccounts', []);
        
        setProvider(tempProvider);
        setSigner(tempSigner);
        setContract(tempContract);
        setAccount(accounts[0]);

        loadProperties(tempContract);
      } else {
        alert('Please install MetaMask!');
      }
    };
    loadBlockchainData();
  }, []);

  const loadProperties = async (contractInstance) => {
    try {
      const ids = await contractInstance.getAllPropertyIds();
      const tempProperties = [];
      for (let id of ids) {
        const [name, owner, price] = await contractInstance.getPropertyDetails(id);
        tempProperties.push({ id: id.toString(), name, owner, price: price.toString() });
      }
      setProperties(tempProperties);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddProperty = async () => {
    try {
      const tx = await contract.addProperty(newProperty.id, newProperty.name, ethers.utils.parseEther(newProperty.price));
      await tx.wait();
      loadProperties(contract);
    } catch (error) {
      console.error(error);
      alert('Error adding property');
    }
  };

  const handleTransferOwnership = async () => {
    try {
      const tx = await contract.transferOwnership(
        transfer.propertyId,
        transfer.newOwner,
        { value: ethers.utils.parseEther(transfer.payment) }
      );
      await tx.wait();
      loadProperties(contract);
    } catch (error) {
      console.error(error);
      alert('Error transferring property');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Real Estate Transaction DApp</h1>
      <p>Connected Account: {account}</p>

      <h2>Add New Property</h2>
      <input
        placeholder="Property ID"
        value={newProperty.id}
        onChange={(e) => setNewProperty({ ...newProperty, id: e.target.value })}
      />
      <input
        placeholder="Property Name"
        value={newProperty.name}
        onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
      />
      <input
        placeholder="Price (in ETH)"
        value={newProperty.price}
        onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
      />
      <button onClick={handleAddProperty}>Add Property</button>

      <h2>Available Properties</h2>
      {properties.length > 0 ? (
        properties.map((prop) => (
          <div key={prop.id} style={{ border: '1px solid gray', margin: '10px', padding: '10px' }}>
            <p><strong>ID:</strong> {prop.id}</p>
            <p><strong>Name:</strong> {prop.name}</p>
            <p><strong>Owner:</strong> {prop.owner}</p>
            <p><strong>Price:</strong> {ethers.utils.formatEther(prop.price)} ETH</p>
          </div>
        ))
      ) : (
        <p>No properties available.</p>
      )}

      <h2>Transfer Ownership</h2>
      <input
        placeholder="Property ID"
        value={transfer.propertyId}
        onChange={(e) => setTransfer({ ...transfer, propertyId: e.target.value })}
      />
      <input
        placeholder="New Owner Address"
        value={transfer.newOwner}
        onChange={(e) => setTransfer({ ...transfer, newOwner: e.target.value })}
      />
      <input
        placeholder="Payment (in ETH)"
        value={transfer.payment}
        onChange={(e) => setTransfer({ ...transfer, payment: e.target.value })}
      />
      <button onClick={handleTransferOwnership}>Transfer Ownership</button>
    </div>
  );
}

export default App;
