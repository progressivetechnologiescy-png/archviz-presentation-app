import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Phone, MapPin } from 'lucide-react';
import { useViewerStore } from '../store/viewerStore';

// Haversine formula to calculate distance in miles
function getDistanceInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Check if string contains coordinates
function extractCoordinates(str) {
  if (!str) return null;
  // Try to parse standard "lat, lng" format
  const match = str.match(/([+-]?\d+\.\d+)\s*,\s*([+-]?\d+\.\d+)/);
  if (match) return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };
  
  // Try to parse from Google Maps iframe or share URL if present
  const pbMatch = str.match(/!3d([+-]?\d+\.\d+)!4d([+-]?\d+\.\d+)/);
  if (pbMatch) return { lat: parseFloat(pbMatch[1]), lon: parseFloat(pbMatch[2]) };
  
  return null;
}

export default function FloatingConcierge() {
  const { customGPS } = useViewerStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [humanReadableLocation, setHumanReadableLocation] = useState(customGPS || 'The Pinnacle Residence');
  const [coordinates, setCoordinates] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Attempt to Reverse Geocode on Mount or GPS Change
  useEffect(() => {
    let active = true;
    const coords = extractCoordinates(customGPS);
    if (coords) {
      setCoordinates(coords);
      // Reverse Geocode using Nominatim
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lon}`)
        .then(r => r.json())
        .then(data => {
          if (!active) return;
          const name = data.address?.city || data.address?.town || data.address?.suburb || data.address?.county || 'this area';
          setHumanReadableLocation(name);
        })
        .catch(() => {
          if (active) setHumanReadableLocation('this area');
        });
    } else {
      setCoordinates(null);
      setHumanReadableLocation(customGPS || 'The Pinnacle Residence');
    }
    return () => { active = false; };
  }, [customGPS]);

  // Update Initial Greeting
  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].role === 'agent')) {
      setMessages([{ role: 'agent', text: `Hi! I am Emma, your digital concierge for the property at ${humanReadableLocation}. How can I help you today?` }]);
    }
  }, [humanReadableLocation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Search Overpass API for nearest amenity
  const searchNearby = async (amenity, fallbackTag, typeLabel) => {
    if (!coordinates) return null;
    try {
      const radius = 5000; // 5km search radius
      const query = `
        [out:json];
        (
          node["amenity"="${amenity}"](around:${radius},${coordinates.lat},${coordinates.lon});
          ${fallbackTag ? `node["${fallbackTag.k}"="${fallbackTag.v}"](around:${radius},${coordinates.lat},${coordinates.lon});` : ''}
        );
        out 1;
      `;
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (data && data.elements && data.elements.length > 0) {
        const place = data.elements[0];
        const name = place.tags?.name || `A local ${typeLabel}`;
        const distance = getDistanceInMiles(coordinates.lat, coordinates.lon, place.lat, place.lon);
        return { name, distance: distance.toFixed(1) };
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isSearching) return;

    const userMsg = inputValue.trim();
    const newHistory = [...messages, { role: 'user', text: userMsg }];
    setMessages(newHistory);
    setInputValue('');
    setIsSearching(true);
    
    // Add "Emma is thinking" indicator
    setMessages(prev => [...prev, { role: 'agent', text: '...', isTyping: true }]);

    const lowerReq = userMsg.toLowerCase();
    
    // 1. Gather dynamic real-world context if the user asks about local amenities
    let dynamicContext = "";
    try {
      if (lowerReq.includes('beach') || lowerReq.includes('ocean') || lowerReq.includes('sea')) {
        const place = await searchNearby('NO_AMENITY', { k: 'natural', v: 'beach' }, 'beach');
        if (place) dynamicContext += `\n[System Info: The nearest beach is ${place.name}, ${place.distance} miles away.]`;
      } 
      if (lowerReq.includes('school') || lowerReq.includes('grammar') || lowerReq.includes('education')) {
        const place = await searchNearby('school', null, 'grammar school');
        if (place) dynamicContext += `\n[System Info: The nearest school is ${place.name}, ${place.distance} miles away.]`;
      } 
      if (lowerReq.includes('restaurant') || lowerReq.includes('food') || lowerReq.includes('eat') || lowerReq.includes('cafe')) {
        const place = await searchNearby('restaurant', { k: 'amenity', v: 'cafe' }, 'dining option');
        if (place) dynamicContext += `\n[System Info: The nearest restaurant is ${place.name}, ${place.distance} miles away.]`;
      } 
      if (lowerReq.includes('hospital') || lowerReq.includes('doctor') || lowerReq.includes('clinic')) {
        const place = await searchNearby('hospital', { k: 'amenity', v: 'clinic' }, 'medical facility');
        if (place) dynamicContext += `\n[System Info: The nearest medical facility is ${place.name}, ${place.distance} miles away.]`;
      }
    } catch (e) {
      console.error("Map search failed", e);
    }

    // 2. Fallback if Gemini is not configured
    const { geminiApiKey, aiContext } = useViewerStore.getState();
    let finalResponse = "";

    if (!geminiApiKey || geminiApiKey.trim() === '') {
      finalResponse = `I'd be happy to connect you with our lead broker to discuss the ${humanReadableLocation} property! (Note: The Administrator has not connected my AI Brain yet. Please enter a Google Gemini API Key in the Asset Manager).`;
      if (dynamicContext) {
         finalResponse += ` However, I did check the map: ${dynamicContext.replace(/\[System Info:\s*(.*?)\]/g, '$1')}`;
      }
    } else {
      // 3. Call Google Gemini REST API
      try {
        const systemInstruction = `You are Emma, an elegant, professional, and highly knowledgeable luxury real estate concierge for the property located at ${humanReadableLocation}. 
You answer client questions concisely and politely. Keep answers relatively short (1-3 sentences) unless they ask for a list. 
If the user asks about pricing, materials, or details, use ONLY the following specifications provided by the real estate agent:
---
${aiContext || 'No specific details provided yet.'}
---
If the user asks about distances to amenities, use the [System Info] context provided in their latest message if available.`;

        // Format history for Gemini (roles must be "user" or "model")
        // Filter out the initial greeting to save tokens, or keep it if you want.
        const geminiHistory = newHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

        // Inject dynamic context invisibly into the user's latest prompt
        if (dynamicContext) {
          geminiHistory[geminiHistory.length - 1].parts[0].text += `\n\n${dynamicContext}`;
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: geminiHistory
          })
        });

        const data = await response.json();
        
        if (data.error) {
          console.error("Gemini API Error:", data.error);
          finalResponse = `I'm having trouble connecting to my AI brain right now. (${data.error.message})`;
        } else if (data.candidates && data.candidates.length > 0) {
          finalResponse = data.candidates[0].content.parts[0].text;
        } else {
          finalResponse = "I'm sorry, I couldn't formulate a response. Could you rephrase that?";
        }
      } catch (e) {
        console.error("Fetch error to Gemini:", e);
        finalResponse = "Sorry, I lost my connection to the AI server. Please try again.";
      }
    }

    setMessages(prev => {
      const msgs = [...prev];
      if (msgs[msgs.length - 1].isTyping) msgs.pop();
      msgs.push({ role: 'agent', text: finalResponse });
      return msgs;
    });
    
    setIsSearching(false);
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
          backgroundColor: 'rgba(15, 20, 25, 0.95)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
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
             background: '#128C7E', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px',
             textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
             color: 'white', fontWeight: 'bold', fontSize: '13px', flexShrink: 0
          }}>
             <Phone size={16} /> Connect with Sales on WhatsApp
          </a>

          {/* Chat History */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'var(--accent-color)' : 'rgba(255,255,255,0.15)',
                padding: '12px 16px', borderRadius: '16px', maxWidth: '85%',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.role === 'agent' ? '4px' : '16px',
                color: 'white', fontSize: '14px', lineHeight: '1.4',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
            <input 
              type="text" 
              placeholder={coordinates ? "Ask about nearby schools, restaurants..." : "Ask about the property..."} 
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isSearching}
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '10px 16px', color: 'white', outline: 'none' }}
            />
            <button 
              onClick={handleSend}
              disabled={isSearching}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-color)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: isSearching ? 0.5 : 1 }}
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
