import { useState } from "react";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);

    const res = await fetch("http://localhost:5001/api/chat-ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    const botMessage = {
      sender: "bot",
      text: data.botResponse,
      recipes: data.recipes,
    };

    setMessages((m) => [...m, botMessage]);
    setLoading(false);
  }

  return (
    <div className="chatbot-container">
      <h1>Recipe Helper Chatbot</h1>

      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`msg ${msg.sender}`}>
            <p>{msg.text}</p>

            {msg.recipes && msg.recipes.length > 0 && (
              <div className="recipe-suggestions">
                {msg.recipes.map((r) => (
                  <div key={r.id} className="recipe-card">
                    <p>{r.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <p>Thinking…</p>}
      </div>

      <div className="chat-input">
        <input
          value={input}
          placeholder="Tell me what ingredients you have..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
