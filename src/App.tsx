import React from 'react';
import { isEqual } from 'lodash';
import { scanToObject } from "./scanner";
import { Alert, Coupon, Item, LoyaltyCard } from './types';
import MAlert from '@mui/material/Alert';
import MAlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface AlertsProps {
  alerts: Alert[]
}
function Alerts({alerts}: AlertsProps) {
  const myList = alerts.map((item, index) => <>
    <MAlert variant="outlined" severity="warning">
      <MAlertTitle>{item.message}</MAlertTitle>
      for item: {item.subject.shortdesc}
    </MAlert><br /></>
  );

  return (
    <>
      <p>{myList.length > 0 ? (<Typography sx={{ fontSize: 14 }} color="text.secondary">Alerts: </Typography>) : ""}</p>
      { myList }
    </>
  )
}

interface LogsProps {
  logs: String[]
}
function Logs({logs}: LogsProps) {
  const myList = logs.map((item, index) =>
    <li key={index}>{item}</li>
  );

  return (
    <>
      <p>{myList.length > 0 ? "Notes:" : ""}</p>
      <ul>
        { myList }
      </ul>
    </>
  )
}

interface CouponsProps {
  coupons: Coupon[]
}
function Coupons({coupons}: CouponsProps) {
  const myList = coupons.map((item, index) =>
    <li key={index}>{item.code}</li>
  );

  return (
    <>
      <p>{myList.length > 0 ? "Coupons:" : ""}</p>
      <ul>
        { myList }
      </ul>
    </>
  )
}

interface ItemsProps {
  items: Item[],
  alerts: Alert[],
}
function Items({items, alerts}: ItemsProps) {
  const myItems = items.map((item, index) =>
    <li key={index}><b>{item.shortdesc}</b><br />
      {item.barcode} (price: {JSON.stringify(item.price)}{item.sn? ", serial no.:"+item.sn : ""})
      <>
      {alerts.filter((a) => isEqual(a.subject, item) ).map((a) => { return (
        <>
          <br />
          <span style={{color: "red"}}>{a.message}</span>
        </>
        ) })}
      </>
    </li>
  );

  if (myItems.length < 1) {
    return (<p>Scan the first item to begin.</p>);
  }
  return (
    <ul>
      { myItems }
    </ul>
  )
}

function AddBar({addItem: addScanned}: any) {
  const [text, setText] = React.useState("");
  function click() {
    const obj = scanToObject(text);
    addScanned(obj);
    setText("");
  }

  return (
    <>
      <label>
        Manual entry:&nbsp;
        <input type="text" name="name" value={text} onChange={(e) => {setText(e.target.value)}} placeholder="Code..."/>
      </label>
      <button onClick={click}>Add</button>
    </>
  );
}

function App() {
  let hardcoded: Item[] = [];
  const [items, setItems] = React.useState(hardcoded);
  let h_coupons: Coupon[] = [];
  const [coupons, setCoupons] = React.useState(h_coupons);
  let h_alerts: Alert[] = [];
  const [alerts, setAlerts] = React.useState(h_alerts);
  let h_logs: String[] = [];
  const [logs, setLogs] = React.useState(h_logs);
  const [loyaltyID, setLoyaltyID] = React.useState<LoyaltyCard>();
  const [subtotal, setSubtotal] = React.useState(0.0);
  const [discount, setDiscount] = React.useState(0.0);
  const [total, setTotal] = React.useState(0.0);
  
  React.useEffect(() => {
    refreshBill();
  }, [items, coupons, loyaltyID]);

  function refreshBill() {
    const payload = {items: items, coupons: coupons, loyaltyID: loyaltyID?.loyaltyID};
    console.log(payload);
    fetch('http://localhost:8080/bill', { method: 'POST', headers: {'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then((response) => response.json())
      .then((data) => {
        setAlerts(data["alerts"]);
        setLogs(data["logs"]);
        setSubtotal(data["subtotal"]);
        setDiscount(data["discount"]);
        setTotal(data["total"]);
      });
  }

  function addScanned(obj: Item | Coupon | LoyaltyCard) {
    if (obj instanceof Item) {
      setItems((prev) => [...prev, obj]);
    } else if (obj instanceof Coupon) {
      setCoupons((prev) => [...prev, obj]);
    } else if (obj instanceof LoyaltyCard) {
      setLoyaltyID(obj);
    }
  }

  React.useEffect(() => {
    let code = "";
    let reading = false;
    const listener = (e: any) => {
      if (e.keyCode === 13) {
        if(code.length > 3 && reading) {
          const obj = scanToObject(code);
          addScanned(obj);
          reading = false;
          code = "";
        }
      } else {
        code += e.key;
      }
      if(!reading) {
        reading = true;
        setTimeout(() => {
          code = "";
          reading = false;
        }, 1000);
      }
    }
    document.addEventListener('keypress', listener);
    return () => document.removeEventListener('keypress', listener);
    }, []);

  return (
      <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
        <AddBar addItem={addScanned} /><br />
        Items:
        <Items items={items} alerts={alerts} />
        <Coupons coupons={coupons} />
        <Logs logs={logs} />
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Subtotal:
                  </Typography>
                  <Typography variant="h3" component="div" align="right">
                    {subtotal}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
            <Card>
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Discount:
                  </Typography>
                  <Typography variant="h3" component="div" align="right">
                    {discount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Total:
                  </Typography>
                  <Typography variant="h3" component="div" align="right">
                    {total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          { loyaltyID ? (<Card><CardContent><Typography sx={{ fontSize: 14 }} color="text.secondary">Loyalty card ID: </Typography><Typography variant="button" display="block" align="right">{loyaltyID.loyaltyID}</Typography></CardContent></Card>) : (<></>) }
          <Alerts alerts={alerts} />
        </Grid>
      </Grid>
      </Box>

  );
}

export default App;
