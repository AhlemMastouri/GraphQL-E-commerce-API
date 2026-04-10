import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'


// Au lieu de React.StrictMode
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />  // Sans StrictMode
)

// Ou commenté :
// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )