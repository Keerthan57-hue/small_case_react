import React, { useState } from 'react';
import { Button, Menu, MenuItem, Switch, FormControlLabel, IconButton, Typography, Container } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';

const SmallcaseIntegration = () => {
  const [includeMF, setIncludeMF] = useState(false);
  const [v2Format, setV2Format] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const fetchHoldings = async () => {
    try {
      const transactionResponse = await axios.post('http://localhost:8000/create_transaction', {
        include_mf: includeMF,
      });
      const transactionData = transactionResponse.data;
      const { response: apiResponse, token: jwtToken, gateway: gatewayName } = transactionData;

      const gatewayInstance = new window.scDK({
        gateway: gatewayName,
        smallcaseAuthToken: jwtToken,
        config: { amo: false }
      });
      const txnResponse = await gatewayInstance.triggerTransaction({
        transactionId: apiResponse.transactionId
      });
      const gatewayToken = txnResponse.data?.gatewayToken;

      const holdingsResponse = await axios.get('http://localhost:8000/fetch_holdings', {
        params: {
          auth_token: gatewayToken,
          include_mf: includeMF,
          v2_format: v2Format
        }
      });
      const holdingsData = holdingsResponse.data;
      console.log('Holdings:', holdingsData);
    } catch (error) {
      console.error('Error fetching holdings:', error);
    }
  };

  return (
    <Container style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Holdings</Typography>
        <div>
          <Button onClick={fetchHoldings} variant="contained" color="primary">Fetch Holdings</Button>
          <IconButton onClick={handleMenuClick}>
            <SettingsIcon />
          </IconButton>
          <Menu
            id="settings-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem>
              <FormControlLabel
                control={<Switch checked={includeMF} onChange={() => setIncludeMF(!includeMF)} />}
                label="Include MF"
              />
            </MenuItem>
            <MenuItem>
              <FormControlLabel
                control={<Switch checked={v2Format} onChange={() => setV2Format(!v2Format)} />}
                label="V2 format"
              />
            </MenuItem>
          </Menu>
        </div>
      </div>
    </Container>
  );
};

export default SmallcaseIntegration;
