import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Mail } from 'lucide-react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your SEO Plugin Pro AI Assistant. How can I help you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat when a new message appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle when user submits a message
  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // 1. Add User's Message to the chat
    const newMessages = [...messages, { sender: 'user', text }];
    setMessages(newMessages);
    setInputText('');

    // 2. Simulate the AI thinking and replying
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let reply = "";

      if (lowerText.includes('install') || lowerText.includes('how to')) {
        reply = "To install the plugin, go to your WordPress Dashboard > Plugins > Add New, upload the .zip file from your Downloads tab, and click Activate.";
      } else if (lowerText.includes('license') || lowerText.includes('key')) {
        reply = "You can view your license keys in the 'Licenses' tab on your left sidebar dashboard.";
      } else if (lowerText.includes('pricing') || lowerText.includes('buy')) {
        reply = "We offer Essential ($5/mo), Advanced Solo ($7/mo), and Pro ($9/mo) plans. Head over to the 'Pricing' tab to upgrade.";
      } else {
        // --- THIS IS THE CUSTOM EMAIL FALLBACK LOGIC ---
        reply = "I couldn't find a solution for that. Please email us at shaheerirfan@encodersstudio.com and we will reach back to you in 2 working days!";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 8000); // 800ms delay to make it feel like a real bot thinking
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* 1. FLOATING CHAT BUTTON */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-105"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* 2. CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white w-96 h-[500px] rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in">
          
          {/* Chat Header */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
              <div>
                <h4 className="font-bold text-sm">SEO Assistant</h4>
                <p className="text-[10px] text-blue-100">AI Support Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
              <X size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-Click Helper Options */}
          <div className="p-2 border-t bg-white flex flex-wrap gap-1.5">
            <button onClick={() => handleSend("How do I install the plugin?")} className="text-[11px] bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-2.5 py-1.5 rounded-full border border-gray-200 transition">
              How to install?
            </button>
            <button onClick={() => handleSend("Where is my license key?")} className="text-[11px] bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-2.5 py-1.5 rounded-full border border-gray-200 transition">
              Find license
            </button>
            <button onClick={() => handleSend("Help! I need to email support")} className="text-[11px] bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 px-2.5 py-1.5 rounded-full border border-gray-200 transition flex items-center gap-1">
              <Mail size={12} /> Email Support
            </button>
          </div>

          {/* Input Box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="p-3 border-t bg-white flex items-center space-x-2"
          >
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition">
              <Send size={18} />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}