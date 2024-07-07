import React, { useState } from 'react';
import axios from 'axios';

const SmallcaseIntegration = () => {
  const [transactionId, setTransactionId] = useState(null);
  const [token, setToken] = useState(null);
  const [gateway, setGateway] = useState(null);
  const [gatewayToken, setGatewaytoken] = useState(null);


  const createTransaction = async () => {
    try {
      const response = await axios.post('http://localhost:8000/create_transaction');
      const data = response.data;
      const { response: apiResponse, token: jwtToken, gateway: gatewayName } = data;
      setTransactionId(apiResponse.transactionId);
      setToken(jwtToken);
      setGateway(gatewayName);
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const initializeGateway = async () => {
    try {
      const gatewayInstance = new window.scDK({
        gateway: gateway,
        smallcaseAuthToken: token,
        config: { amo: false }
      });
      const txnResponse = await gatewayInstance.triggerTransaction({
        transactionId: transactionId
      });
      const gatewayToken = txnResponse.data?.gatewayToken;
      setGatewaytoken(gatewayToken);
    } catch (err) {
      console.error('unable to get response:', err.message);
    }
  };

  const fetchHoldings = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/fetch_holdings?auth_token=${gatewayToken}`);
      const data = response.data;
      console.log('Holdings:', data);
    } catch (error) {
      console.error('Error fetching holdings:', error);
    }
  };

  return (
    <div>
      <button onClick={createTransaction}>Create Transaction</button>
      <button onClick={initializeGateway}>Initialize Gateway</button>
      <button onClick={fetchHoldings}>Tetch Holdings</button>
    </div>
  );
};

export default SmallcaseIntegration;
