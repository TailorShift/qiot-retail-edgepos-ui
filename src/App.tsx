import React from 'react';
import { isEqual } from 'lodash';
import { scanToObject } from "./scanner";
import { Alert, Coupon, Item, LoyaltyCard } from './types';

interface AlertsProps {
  alerts: Alert[]
}
function Alerts({alerts}: AlertsProps) {
  const myList = alerts.map((item, index) =>
    <li key={index}><b>{item.message}</b><br />
    for item: {item.subject.shortdesc}
    </li>
  );

  return (
    <>
      <p>{myList.length > 0 ? "Alerts:" : ""}</p>
      <ul>
        { myList }
      </ul>
    </>
  )
}

interface LogsProps {
  logs: String[]
}
function Logs({logs}: LogsProps) {
  const myList = logs.map((item, index) =>
    <li key={index}> {item}</li>
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

  return (
    <ul>
      { myItems }
    </ul>
  )
}

function AddBar({addItem}: any) {
  const [text, setText] = React.useState("");
  function click() {
    fetch('http://localhost:8080/scan', { method: 'POST', body: text })
      .then((response) => response.json())
      .then((data) => addItem(data));
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
  let hardcoded: Item[] = [
    {barcode:"barcode", shortdesc:"apple", category:"GROCERY", price:1.99, weight:1 },
  ];
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

  function addItem(i: Item) {
    setItems((prev) => [...prev, i]);
  }
  
  React.useEffect(() => {
    refreshBill();
  }, [items, coupons, loyaltyID]);

  function refreshBill() {
    const payload = {items: items, coupons: coupons, loyaltyID: loyaltyID?.loyaltyID};
    fetch('http://localhost:8080/bill', { method: 'POST', headers: {'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then((response) => response.json())
      .then((data) => {
        setAlerts(data["alerts"]);
        setLogs(data["logs"]);
        setSubtotal(data["subtotal"]);
        setDiscount(data["discount"]);
        setTotal(data["total"]);
      });
    console.log(alerts);
  }


  React.useEffect(() => {
    let code = "";
    let reading = false;
    const listener = (e: any) => {
      if (e.keyCode === 13) {
        if(code.length > 3 && reading) {
          const obj = scanToObject(code);
          if (obj instanceof Item) {
            addItem(obj);
          } else if (obj instanceof Coupon) {
            setCoupons((prev) => [...prev, obj]);
          } else if (obj instanceof LoyaltyCard) {
            setLoyaltyID(obj);
          }
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
    <div>
      Subtotal: {subtotal}, Discount: {discount}, Total: {total}
      { loyaltyID ? (
        <><br />Loyalty card ID: {loyaltyID.loyaltyID}</>
      ) : (<></>)
      }
      <Alerts alerts={alerts} />
      <p>Items:</p>
      <Items items={items} alerts={alerts} />
      <AddBar addItem={addItem} />
      <Logs logs={logs} />
    </div>
  );
}

export default App;
