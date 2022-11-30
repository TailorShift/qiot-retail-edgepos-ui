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

function SearchBar({addItem}: any) {
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
        <input type="text" name="name" value={text} onChange={(e) => {setText(e.target.value)}} placeholder="Search..."/>
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
      <SearchBar addItem={addItem} />
    </div>
  );
}

export default App;
