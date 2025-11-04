import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    // Fetch from your backend API
    fetch("http://localhost:5001/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error("Error fetching data:", err);
        setMessage("Failed to connect to backend");
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>FlavorMatch</h1>
        <p>{message}</p>
      </header>
    </div>
  );
}

export default App;
