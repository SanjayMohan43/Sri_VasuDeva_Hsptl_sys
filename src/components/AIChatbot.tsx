import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
};

// System prompt to give the bot its hospital identity
const HOSPITAL_CONTEXT = `
You are CareBot, an advanced AI Assistant for Sri VasuDeva Medicals.
Your role is to help patients and staff with medical inquiries, hospital services, and pharmacy guidance.
Always be polite, compassionate, professional, and concise. 
Format your responses using Markdown for better readability (bolding, lists).
Do not diagnose severe medical emergencies; instead, advise the user to visit the emergency room immediately.
`;

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I am CareBot 🤖. How can I assist you today at Sri VasuDeva Medicals?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const newMessage: Message = { id: Date.now().toString(), sender: "user", text: userText };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "bot",
            text: "⚠️ **Setup Error**: I am missing my Gemini API Key.\n\nPlease define `VITE_GEMINI_API_KEY` in your project's `.env` file so I can wake up!",
          },
        ]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest",
        systemInstruction: HOSPITAL_CONTEXT,
      });

      // Transform previous messages into conversation history format (skip welcome message)
      const historyMsg = messages.slice(1).map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));
      
      const chat = model.startChat({
        history: historyMsg,
      });

      const result = await chat.sendMessage(userText);
      const responseText = result.response.text();

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: "bot", text: responseText },
      ]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "bot",
          text: `⚠️ **Connection Error**:\n\n${errorMessage}\n\nPlease check your console for more details.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white dark:bg-card border border-border shadow-2xl rounded-2xl w-[350px] sm:w-[400px] h-[500px] flex flex-col mb-4 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between text-primary-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 fill-primary-foreground/20" />
                <div>
                  <h3 className="font-semibold text-sm">CareBot AI</h3>
                  <p className="text-[10px] text-primary-foreground/80 leading-none">Powered by Gemini</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/20 p-1 rounded-md transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/20">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-emerald-100 text-emerald-600 border border-emerald-200"}`}>
                    {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[75%] px-3 py-2 text-sm rounded-2xl ${msg.sender === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-white border rounded-tl-none shadow-sm prose prose-sm dark:prose-invert"}`}>
                    {msg.sender === "user" ? msg.text : <div className="markdown-chat"><ReactMarkdown>{msg.text}</ReactMarkdown></div>}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600 border border-emerald-200">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="px-4 py-3 bg-white border rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-card border-t flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about medicines or services..."
                className="flex-1 bg-secondary border-0 focus:ring-1 focus:ring-primary rounded-full px-4 py-2 text-sm outline-none"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="rounded-full shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-primary-foreground shadow-lg h-14 w-14 rounded-full flex items-center justify-center relative hover:shadow-xl transition-shadow"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">
            1
          </span>
        )}
      </motion.button>
    </div>
  );
}
