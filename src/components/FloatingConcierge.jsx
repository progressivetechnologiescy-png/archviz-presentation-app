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
  const { customGPS, active3DLocationName, controlMode } = useViewerStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [humanReadableLocation, setHumanReadableLocation] = useState(customGPS || 'The Pinnacle Residence');
  const [coordinates, setCoordinates] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isTouchDevice] = useState(() => typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)));
  
  const messagesEndRef = useRef(null);

  // Attempt to Geocode/Reverse Geocode on Mount or GPS Change
  useEffect(() => {
    let active = true;
    const str = customGPS || 'The Pinnacle Residence';
    const coords = extractCoordinates(str);
    
    if (coords) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      setHumanReadableLocation(str);
      // Forward Geocode the text string to get coordinates for map searches
      fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(str)}&limit=1`)
        .then(r => r.json())
        .then(data => {
          if (!active) return;
          if (data && data.length > 0) {
            setCoordinates({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
          } else {
            setCoordinates(null);
          }
        })
        .catch(() => {
          if (active) setCoordinates(null);
        });
    }
    return () => { active = false; };
  }, [customGPS]);

  // Update Initial Greeting
  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].role === 'agent')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([{ role: 'agent', text: `Hi! I am Emma, your digital concierge for the property at ${humanReadableLocation}. How can I help you today?` }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [humanReadableLocation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Search Overpass API for nearest amenity (polygon-aware, resilient multi-mirror fallback)
  const searchNearby = async (amenity, fallbackTag, typeLabel) => {
    if (!coordinates) return null;
    const radius = 5000; // 5km search radius
    
    // Search nodes, ways (polygons), and relations, requesting calculated centers
    const query = `
      [out:json];
      (
        node["amenity"="${amenity}"](around:${radius},${coordinates.lat},${coordinates.lon});
        way["amenity"="${amenity}"](around:${radius},${coordinates.lat},${coordinates.lon});
        relation["amenity"="${amenity}"](around:${radius},${coordinates.lat},${coordinates.lon});
        ${fallbackTag ? `
          node["${fallbackTag.k}"="${fallbackTag.v}"](around:${radius},${coordinates.lat},${coordinates.lon});
          way["${fallbackTag.k}"="${fallbackTag.v}"](around:${radius},${coordinates.lat},${coordinates.lon});
          relation["${fallbackTag.k}"="${fallbackTag.v}"](around:${radius},${coordinates.lat},${coordinates.lon});
        ` : ''}
      );
      out center 50;
    `;

    // Redundant mirror endpoints for high availability (handles blocks or rate limits)
    const endpoints = [
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`,
      `https://lz4.overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        
        if (data && data.elements && data.elements.length > 0) {
          const items = data.elements
            .map(place => {
              const name = place.tags?.name || place.tags?.brand || `A local ${typeLabel}`;
              const lat = place.lat || place.center?.lat;
              const lon = place.lon || place.center?.lon;
              if (lat && lon) {
                const distance = getDistanceInMiles(coordinates.lat, coordinates.lon, lat, lon);
                return { name, distance };
              }
              return null;
            })
            .filter(Boolean);

          if (items.length > 0) {
            // Sort by distance ascending
            items.sort((a, b) => a.distance - b.distance);
            
            // Format nearby list for context (top 5 unique names)
            const seenNames = new Set();
            const uniqueItems = [];
            for (const item of items) {
              if (!seenNames.has(item.name)) {
                seenNames.add(item.name);
                uniqueItems.push(item);
              }
              if (uniqueItems.length >= 5) break;
            }

            const nearbyList = uniqueItems
              .map(p => `${p.name} (${p.distance.toFixed(1)} miles away)`)
              .join(', ');
              
            return { 
              name: uniqueItems[0].name, 
              distance: uniqueItems[0].distance.toFixed(1),
              nearbyList
            };
          }
        }
      } catch (e) {
        console.warn(`Overpass mirror failed: ${url}`, e);
      }
    }
    return null;
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
        if (place) {
          dynamicContext += `\n[System Info: The nearest beach is ${place.name}, ${place.distance} miles away. Other nearby beaches: ${place.nearbyList}.]`;
        }
      } 
      if (lowerReq.includes('school') || lowerReq.includes('grammar') || lowerReq.includes('education') || lowerReq.includes('college') || lowerReq.includes('university') || lowerReq.includes('high school')) {
        const place = await searchNearby('school', null, 'grammar school');
        if (place) {
          dynamicContext += `\n[System Info: The nearest school is ${place.name}, ${place.distance} miles away. Other nearby schools: ${place.nearbyList}.]`;
        }
      } 
      if (lowerReq.includes('restaurant') || lowerReq.includes('food') || lowerReq.includes('eat') || lowerReq.includes('cafe') || lowerReq.includes('dining')) {
        const place = await searchNearby('restaurant', { k: 'amenity', v: 'cafe' }, 'dining option');
        if (place) {
          dynamicContext += `\n[System Info: The nearest restaurant is ${place.name}, ${place.distance} miles away. Other nearby dining options: ${place.nearbyList}.]`;
        }
      } 
      if (lowerReq.includes('hospital') || lowerReq.includes('doctor') || lowerReq.includes('clinic') || lowerReq.includes('pharmacy') || lowerReq.includes('medical')) {
        const place = await searchNearby('hospital', { k: 'amenity', v: 'clinic' }, 'medical facility');
        if (place) {
          dynamicContext += `\n[System Info: The nearest medical facility is ${place.name}, ${place.distance} miles away. Other nearby medical facilities: ${place.nearbyList}.]`;
        }
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

The user is currently physically standing in / exploring this specific area: **${active3DLocationName || 'Exterior Plaza'}**. 
If they ask questions like "where am I?", "what is this room?", "describe this space", "what am I looking at?", or ask you about the features of their current location, focus your details conversationally on **${active3DLocationName || 'the exterior grounds'}** and its amenities.

If the user asks about distances or what amenities (like schools, beaches, restaurants, medical facilities) are nearby, use the real-world [System Info] context provided in their latest message.
If the name of a school or amenity is in Greek (e.g. 'Γυμνάσιο Λινόπετρας' or 'Λύκειο Αγίου Νικολάου'), translate it to English (e.g. 'Linopetra High School' or 'Ayios Nikolaos Lyceum') for the client's convenience, or display both. If they ask about "schools" (plural), mention the closest one and list the other top nearby options from the [System Info] context to give them a complete, premium overview of the location.
If the user asks about pricing, materials, or details, use ONLY the following specifications provided by the real estate agent:
---
${aiContext || 'No specific details provided yet.'}
---`;

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
    <div style={{ 
      position: 'fixed', 
      bottom: (controlMode === 'walk' && isTouchDevice) ? '120px' : '32px', 
      right: '32px', 
      zIndex: 9999, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-end',
      transition: 'bottom 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    }}>
      
      <style>{`
        @keyframes chatEntrance {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chat-window {
          animation: chatEntrance 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
        }
        .dot-blink {
          animation: dotBlink 1.4s infinite both;
        }
        .whatsapp-action-banner {
          transition: all 0.25s ease !important;
        }
        .whatsapp-action-banner:hover {
          background: rgba(37, 211, 102, 0.16) !important;
          color: #4ade80 !important;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(56, 189, 248, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
        }
      `}</style>

      {/* Expanded Chat Interface */}
      {isOpen && (
        <div className="glass-panel chat-window" style={{ 
          width: '350px', height: '550px', marginBottom: '16px', borderRadius: '24px',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          backgroundColor: 'rgba(10, 12, 18, 0.75)',
          backdropFilter: 'blur(30px) saturate(190%)',
          WebkitBackdropFilter: 'blur(30px) saturate(190%)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.25)'
        }}>
          
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }}>
                 <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Agent" />
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'white', fontSize: '15px', fontWeight: '700', letterSpacing: '0.3px' }}>Emma</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: '500' }}>AI Property Concierge</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.8}>
              <X size={20} />
            </button>
          </div>

          {/* Quick Action WhatsApp Banner */}
          <a href="https://wa.me/15551234567" target="_blank" rel="noreferrer" style={{
             background: 'rgba(37, 211, 102, 0.08)', borderBottom: '1px solid rgba(59, 130, 246, 0.15)', padding: '12px',
             textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
             color: '#4ade80', fontWeight: '600', fontSize: '13px', flexShrink: 0
          }} className="whatsapp-action-banner">
             <Phone size={14} fill="#4ade80" stroke="none" /> 
             <span>Connect with Sales on WhatsApp</span>
          </a>

          {/* Chat History */}
          <div className="chat-scrollbar" style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : 'rgba(255, 255, 255, 0.08)',
                padding: '12px 16px', borderRadius: '16px', maxWidth: '85%',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.role === 'agent' ? '4px' : '16px',
                color: '#ffffff', 
                fontSize: '14px', lineHeight: '1.4',
                boxShadow: msg.role === 'user' ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(59, 130, 246, 0.15)'
              }}>
                {msg.isTyping ? (
                  <div style={{ display: 'flex', gap: '5px', padding: '6px 4px', alignItems: 'center' }}>
                    <span className="dot-blink" style={{ width: '6px', height: '6px', background: '#60a5fa', borderRadius: '50%' }}></span>
                    <span className="dot-blink" style={{ width: '6px', height: '6px', background: '#60a5fa', borderRadius: '50%', animationDelay: '0.2s' }}></span>
                    <span className="dot-blink" style={{ width: '6px', height: '6px', background: '#60a5fa', borderRadius: '50%', animationDelay: '0.4s' }}></span>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '16px', borderTop: '1px solid rgba(59, 130, 246, 0.15)', display: 'flex', gap: '8px', background: 'rgba(15, 18, 26, 0.9)', flexShrink: 0 }}>
            <input 
              type="text" 
              placeholder={coordinates ? "Ask about nearby schools, restaurants..." : "Ask about the property..."} 
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isSearching}
              style={{ flex: 1, background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '20px', padding: '12px 18px', color: '#ffffff', outline: 'none', fontSize: '14px', transition: 'all 0.2s' }}
              onFocus={(e) => { e.target.style.borderColor = '#60a5fa'; e.target.style.boxShadow = '0 0 10px rgba(96, 165, 250, 0.25)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(59, 130, 246, 0.25)'; e.target.style.boxShadow = 'none'; }}
            />
            <button 
              onClick={handleSend}
              disabled={isSearching}
              style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: isSearching ? 0.5 : 1, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)', transition: 'all 0.2s' }}
            >
              <Send size={16} />
            </button>
          </div>

        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setIsOpen(true)}
            className="hover-lift"
            style={{ 
              width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', 
              border: '2px solid rgba(255,255,255,0.6)', color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(59, 130, 246, 0.35)',
              flexShrink: 0
            }}
          >
            <MessageSquare size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
