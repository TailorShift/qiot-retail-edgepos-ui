import React from 'react';
import { isEqual } from 'lodash';

interface Item {
  barcode: String,
  shortdesc: String,
  category: String,
  price: Number,
  weight: Number,
}
interface Alert {
  subject: Item,
  message: String,
}

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

interface ItemsProps {
  items: Item[],
  alerts: Alert[],
}
function Items({items, alerts}: ItemsProps) {
  const myItems = items.map((item, index) =>
    <li key={index}><b>{item.shortdesc}</b><br />
      {item.barcode} (price: {JSON.stringify(item.price)})
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

  React.useEffect(() => {
    let code = "";
    let reading = false;
    const listener = (e: any) => {
      if (e.keyCode === 13) {
        if(code.length > 3 && reading) {
          fetch('http://localhost:8080/scan', { method: 'POST', body: code })
            .then((response) => response.json())
            .then((data) => addItem(data));
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
        }, 500);
      }
    }
    document.addEventListener('keypress', listener);
    return () => document.removeEventListener('keypress', listener);
    }, []);

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
  let h_alerts: Alert[] = [];
  const [alerts, setAlerts] = React.useState(h_alerts);

  function addItem(i: Item) {
    setItems((prev) => [...prev, i]);
    refreshAlerts();
  }

  function refreshAlerts() {
    const payload = {items: items};
    fetch('http://localhost:8080/alert', { method: 'POST', headers: {'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then((response) => response.json())
      .then((data) => setAlerts(data));
    console.log(alerts);
  }

  return (
    <div>
      <Alerts alerts={alerts} />
      <p>Items:</p>
      <Items items={items} alerts={alerts} />
      <AddBar addItem={addItem} />
    </div>
  );
}

export default App;
