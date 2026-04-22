import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, MapPin, Phone } from 'lucide-react';
import { useViewerStore } from '../store/viewerStore';

export default function FloatingConcierge() {
  const { customGPS } = useViewerStore();
  const locationName = customGPS || 'The Pinnacle Residence';
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Dynamically update the greeting if the cloud database fetches a new GPS location
  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].role === 'agent')) {
      setMessages([{ role: 'agent', text: `Hi! I am Emma, your digital concierge for the property at ${locationName}. How can I help you today?` }]);
    }
  }, [locationName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');

      // Simulate AI processing context
      setTimeout(() => {
        let response = `I'd be happy to connect you with our lead broker to discuss the ${locationName} property in detail!`;
        const lowerReq = userMsg.toLowerCase();

        if (lowerReq.includes('beach') || lowerReq.includes('ocean')) {
          response = `Based on the property's location at ${locationName}, you are just a 5-minute drive from the nearest pristine coastline and private beach clubs.`;
        } else if (lowerReq.includes('school')) {
          response = `The residence at ${locationName} is located within a highly-rated school zone. The international prep academy is only 3 miles away!`;
        } else if (lowerReq.includes('restaurant') || lowerReq.includes('food') || lowerReq.includes('eat')) {
          response = `Since you're located at ${locationName}, there's an incredible Michelin-star restaurant and several premium cafes just a 5-10 minute walk away!`;
        } else if (lowerReq.includes('neighborhood') || lowerReq.includes('area') || lowerReq.includes('location')) {
          response = `The area around ${locationName} is extremely safe, featuring 24/7 private security patrols and exclusive neighborhood access.`;
        } else if (lowerReq.includes('amenities') || lowerReq.includes('gym') || lowerReq.includes('pool')) {
          response = 'The property features a private infinity pool, a state-of-the-art wellness center, and a 24/7 concierge.';
        } else if (lowerReq.includes('price') || lowerReq.includes('cost')) {
          response = 'Pricing starts at $1.25M for our 2-Bedroom layouts. You can view full pricing in the Availability tab!';
        }

        setMessages(prev => [...prev, { role: 'agent', text: response }]);
      }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* Expanded Chat Interface */}
      {isOpen && (
        <div className="glass-panel" style={{ 
          width: '350px', height: '500px', marginBottom: '16px', borderRadius: '24px',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
        }}>
          
          {/* Header */}
          <div style={{ background: 'var(--accent-color)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', overflow: 'hidden' }}>
                 <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Agent" />
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'white', fontSize: '16px' }}>Emma</h4>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>AI Property Concierge</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Quick Action WhatsApp Banner */}
          <a href="https://wa.me/15551234567" target="_blank" rel="noreferrer" style={{
             background: 'rgba(37, 211, 102, 0.1)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px',
             textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
             color: '#25D366', fontWeight: 'bold', fontSize: '13px'
          }}>
             <Phone size={16} /> Connect with Sales on WhatsApp
          </a>

          {/* Chat History */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                padding: '12px 16px', borderRadius: '16px', maxWidth: '85%',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.role === 'agent' ? '4px' : '16px',
                color: 'white', fontSize: '14px', lineHeight: '1.4'
              }}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Ask about location, schools..." 
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '10px 16px', color: 'white', outline: 'none' }}
            />
            <button 
              onClick={handleSend}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-color)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Send size={16} />
            </button>
          </div>

        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="hover-lift"
          style={{ 
            width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-color)', 
            border: '2px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 32px var(--accent-glow)'
          }}
        >
          <MessageSquare size={28} />
        </button>
      )}
    </div>
  );
}
