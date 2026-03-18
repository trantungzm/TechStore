import React from 'react';
import ReactDOM, { createRoot ,useState} from 'react-dom/client';
import './index.css';
import App from './App';
import "bootstrap/dist/css/bootstrap.min.css";
/*
const myelement =(
   <table>
     <tr>
        <th>
          Name
        </th>
     </tr>
     <tr>
      <td>John</td>
     </tr>
     <tr>
      <td>Elsa</td>
     </tr>
   </table>
);

function Greeting({ name, age }) {
  return <h1>Hello, {name}! You are {age} years old.</h1>;
}
function Counter() {
  // Destructuring the array returned by useState
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

createRoot(document.getElementById('root')).render(
  <Counter />
);
*/


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

