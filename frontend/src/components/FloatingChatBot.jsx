import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/Chatbot.css";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function FloatingChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  function toggleChat() {
    setOpen((prev) => {
      const nowOpen = !prev;

      if (nowOpen && messages.length === 0) {
        setMessages([
          {
            sender: "bot",
            text: "👋 Hi, I'm FlavorBot! Tell me the ingredients you have!",
          },
        ]);
      }

      return nowOpen;
    });
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const res = await fetch(`${API_URL}/api/chat-ingredients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage.text }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: data.botResponse, recipes: data.recipes },
    ]);
    setLoading(false);
  }

  return (
    <>
      {/* Floating button */}
      <button className="chatbot-button" onClick={toggleChat}>
        <img src="frontend/src/images/FlavorBot.png" alt="" className="chatbot-icon" />
      </button>

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>FlavorBot</h3>
            <button className="close-btn" onClick={toggleChat}>✖</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.sender}`}>
                <p>{msg.text}</p>

                {msg.recipes?.length > 0 && (
                  <div className="recipe-list">
                    {msg.recipes.map((r) => (
                      <Link key={r.id} to={`/recipe/${r.id}`} className="recipe-bubble">
                        {r.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="typing-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Tell me the ingredients you have..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
