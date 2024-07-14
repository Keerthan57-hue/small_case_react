import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';

const SmallcaseIntegration = () => {
  const [includeMF, setIncludeMF] = useState(false);
  const [v2Format, setV2Format] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [gatewayToken, setGatewayToken] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const connectBroker = async () => {
    try {
      const transactionResponse = await axios.post('http://localhost:8001/create_transaction');
      const transactionData = transactionResponse.data;
      const { response: apiResponse, token: jwtToken, gateway: gatewayName } = transactionData;
      console.log('Transaction:', transactionData);
  
      const gatewayInstance = new window.scDK({
        gateway: gatewayName,
        smallcaseAuthToken: jwtToken,
        config: { amo: false }
      });

      gatewayInstance.triggerTransaction({
        transactionId: apiResponse.transactionId
      })
      .then(txnResponse => {
        console.log('Transaction response:', txnResponse);
        setGatewayToken(txnResponse.data?.smallcaseAuthToken);
        setIsConnected(true);
      })
      .catch(err => {
        console.log('Transaction error:', err.message);
      });
    } catch (error) {
      console.error('Error connecting to broker:', error);
    }
  };

  const fetchHoldings = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isConnected) {
      setPopupOpen(true);
      return;
    }
    try {
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

  const handlePopupClose = () => {
    setPopupOpen(false);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Smallcase Integration
          </Typography>
          <Button color="inherit" onClick={connectBroker}>Connect</Button>
        </Toolbar>
      </AppBar>
      <Container style={{ marginTop: '20px' }}>
        <Card>
          <CardContent>
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
          </CardContent>
        </Card>
        <Dialog
          open={popupOpen}
          onClose={handlePopupClose}
        >
          <DialogTitle>Invalid operation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Operation not available for guest user.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePopupClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
};

export default SmallcaseIntegration;