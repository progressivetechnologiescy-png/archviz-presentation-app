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
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsSearching(true);
    
    // Add "Emma is thinking" indicator
    setMessages(prev => [...prev, { role: 'agent', text: '...', isTyping: true }]);

    const lowerReq = userMsg.toLowerCase();
    let finalResponse = `I'd be happy to connect you with our lead broker to discuss the ${humanReadableLocation} property in detail!`;

    try {
      if (lowerReq.includes('beach') || lowerReq.includes('ocean') || lowerReq.includes('sea')) {
        const place = await searchNearby('NO_AMENITY', { k: 'natural', v: 'beach' }, 'beach');
        if (place) {
          finalResponse = `Based on the property's location, the nearest beach is **${place.name}**, located just ${place.distance} miles away!`;
        } else {
          finalResponse = `There don't appear to be any major public beaches immediately nearby the ${humanReadableLocation} property.`;
        }
      } 
      else if (lowerReq.includes('school') || lowerReq.includes('grammar') || lowerReq.includes('education')) {
        const place = await searchNearby('school', null, 'grammar school');
        if (place) {
          finalResponse = `The property is in an excellent district! The nearest school is **${place.name}**, only ${place.distance} miles away.`;
        } else {
          finalResponse = `The residence is located within a highly-rated school zone, with several academies within a short driving distance.`;
        }
      } 
      else if (lowerReq.includes('restaurant') || lowerReq.includes('food') || lowerReq.includes('eat') || lowerReq.includes('cafe')) {
        const place = await searchNearby('restaurant', { k: 'amenity', v: 'cafe' }, 'dining option');
        if (place) {
          finalResponse = `Since you're located at ${humanReadableLocation}, there are incredible dining options nearby. The closest is **${place.name}**, just ${place.distance} miles away!`;
        } else {
          finalResponse = `Since you're located at ${humanReadableLocation}, there are incredible premium cafes and dining options just a 5-10 minute walk away!`;
        }
      } 
      else if (lowerReq.includes('hospital') || lowerReq.includes('doctor') || lowerReq.includes('clinic')) {
        const place = await searchNearby('hospital', { k: 'amenity', v: 'clinic' }, 'medical facility');
        if (place) {
          finalResponse = `For peace of mind, the nearest medical facility is **${place.name}**, located just ${place.distance} miles away.`;
        } else {
          finalResponse = `The property is located within 15 minutes of major regional healthcare facilities.`;
        }
      }
      else if (lowerReq.includes('neighborhood') || lowerReq.includes('area') || lowerReq.includes('location') || lowerReq.includes('where')) {
        finalResponse = `This property is located in ${humanReadableLocation}. It is an extremely safe area featuring 24/7 private security patrols and exclusive neighborhood access.`;
      } 
      else if (lowerReq.includes('amenities') || lowerReq.includes('gym') || lowerReq.includes('pool')) {
        finalResponse = 'The property features a private infinity pool, a state-of-the-art wellness center, and a 24/7 concierge.';
      } 
      else if (lowerReq.includes('price') || lowerReq.includes('cost')) {
        finalResponse = 'Pricing starts at $1.25M for our 2-Bedroom layouts. You can view full pricing in the Availability tab!';
      }
    } catch (e) {
      console.error(e);
    }

    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs[newMsgs.length - 1].isTyping) newMsgs.pop();
      newMsgs.push({ role: 'agent', text: finalResponse });
      return newMsgs;
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
