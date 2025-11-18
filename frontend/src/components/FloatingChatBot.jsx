/* This file controls the chat bot box that appears on every page. I(Alivia) implented the bot to have
    - a welcome prompt
    - a Text input
    - To appear on each page on the bottom right */
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function FloatingChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Open/close chat + send greeting
  function toggleChat() {
    setOpen((prev) => {
      const nowOpen = !prev;

      if (nowOpen && messages.length === 0) {
        setMessages([
          {
            sender: "bot",
            text:
              "👋 Hi, I'm FlavorBot! Tell me the ingredients you have, and I’ll help you find delicious recipes to try!",
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

    const res = await fetch("http://localhost:5001/api/chat-ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage.text }),
    });

    const data = await res.json();

    const botMessage = {
      sender: "bot",
      text: data.botResponse,
      recipes: data.recipes,
    };

    setMessages((prev) => [...prev, botMessage]);
    setLoading(false);
  }

  return (
    <>
      {/* Floating button */}
      <button className="chatbot-button" onClick={toggleChat}>
        💬
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>FlavorBot</h3>
            <button className="close-btn" onClick={toggleChat}>
              ✖
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.sender}`}>
                <p>{msg.text}</p>

                {/* Recipe suggestions with links */}
                {msg.recipes && msg.recipes.length > 0 && (
                  <div className="recipe-list">
                    {msg.recipes.map((r) => (
                      <Link
                        key={r.id}
                        to={`/recipe/${r.id}`}
                        className="recipe-bubble"
                      >
                        {r.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing animation */}
            {loading && (
              <div className="typing-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* User Input */}
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
