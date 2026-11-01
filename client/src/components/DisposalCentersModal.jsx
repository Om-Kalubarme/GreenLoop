import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  X, 
  Search, 
  Navigation, 
  Phone, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  ChevronRight,
  Filter,
  Check,
  Compass,
  Building2,
  RefreshCw,
  Maximize2,
  Globe
} from 'lucide-react';

export const DISPOSAL_CENTERS = [
  // Bengaluru
  {
    id: 'blr-1',
    name: 'EcoReclaim Hub - Koramangala',
    city: 'Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
    distance: '1.4 km',
    distanceKm: 1.4,
    phone: '+91 80 2553 4412',
    hours: 'Mon-Sat: 8:30 AM – 7:30 PM (Sun: 9 AM – 2 PM)',
    acceptedStreams: ['cardboard', 'wood', 'glass', 'plastic'],
    acceptedLabels: ['Clean Cardboard', 'Timber Pallets', 'Glass Containers', 'HDPE Plastics'],
    rating: '4.9 ★',
    verified: true,
    capacityStatus: 'Accepting Batches',
    notes: 'Free drop-off for students & local makers. Weigh-bridge available on site.'
  },
  {
    id: 'blr-2',
    name: 'GreenLoop Community Depot - Indiranagar',
    city: 'Bengaluru',
    lat: 12.9719,
    lng: 77.6412,
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    distance: '3.8 km',
    distanceKm: 3.8,
    phone: '+91 80 4115 8890',
    hours: 'Daily: 8:00 AM – 8:00 PM',
    acceptedStreams: ['textile', 'metal', 'cardboard', 'electronics'],
    acceptedLabels: ['Apparel Offcuts', 'Metal Trimmings', 'Packaging Boxes', 'E-Scrap'],
    rating: '4.8 ★',
    verified: true,
    capacityStatus: 'High Demand',
    notes: 'Equipped with fabric sorting bins and metal offcut scales.'
  },
  {
    id: 'blr-3',
    name: 'Whitefield Clean Tech Circular Depot',
    city: 'Bengaluru',
    lat: 12.9866,
    lng: 77.7344,
    address: 'ITPL Main Rd, Phase 2, Whitefield, Bengaluru, Karnataka 560066',
    distance: '7.2 km',
    distanceKm: 7.2,
    phone: '+91 80 2841 3320',
    hours: 'Mon-Fri: 9:00 AM – 6:30 PM',
    acceptedStreams: ['electronics', 'metal', 'plastic', 'cardboard'],
    acceptedLabels: ['E-Waste & Circuitry', 'Aluminum Profiles', 'Engineering Plastics', 'Cardboard'],
    rating: '4.9 ★',
    verified: true,
    capacityStatus: 'Accepting Batches',
    notes: 'Certified for responsible electronic disassembly and circular salvage.'
  },
  {
    id: 'blr-4',
    name: 'Jayanagar Artisan Materials Depot',
    city: 'Bengaluru',
    lat: 12.9299,
    lng: 77.5833,
    address: '11th Main Rd, 4th Block, Jayanagar, Bengaluru, Karnataka 560011',
    distance: '4.5 km',
    distanceKm: 4.5,
    phone: '+91 80 2656 1200',
    hours: 'Tue-Sun: 9:30 AM – 7:00 PM (Closed Mon)',
    acceptedStreams: ['wood', 'glass', 'textile'],
    acceptedLabels: ['Reclaimed Timber', 'Studio Glassware', 'Linen & Canvas'],
    rating: '4.7 ★',
    verified: true,
    capacityStatus: 'Accepting Batches',
    notes: 'Direct coordination with local craft guilds and architecture colleges.'
  },

  // Mumbai
  {
    id: 'mum-1',
    name: 'Bandra Artisan Circular Station',
    city: 'Mumbai',
    lat: 19.0544,
    lng: 72.8277,
    address: 'Hill Road, Near Mehboob Studio, Bandra West, Mumbai, Maharashtra 400050',
    distance: '2.1 km',
    distanceKm: 2.1,
    phone: '+91 22 2640 5511',
    hours: 'Daily: 9:00 AM – 8:00 PM',
    acceptedStreams: ['textile', 'wood', 'cardboard', 'glass'],
    acceptedLabels: ['Fabric Remnants', 'Studio Timber Offcuts', 'Kraft Paper', 'Bottles'],
    rating: '4.9 ★',
    verified: true,
    capacityStatus: 'Accepting Batches',
    notes: 'Active hub for fashion studio scraps and upcycled design collections.'
  },
  {
    id: 'mum-2',
    name: 'Andheri Eco-Recovery Depot',
    city: 'Mumbai',
    lat: 19.1136,
    lng: 72.8697,
    address: 'Western Express Highway, Chakala, Andheri East, Mumbai, Maharashtra 400099',
    distance: '5.6 km',
    distanceKm: 5.6,
    phone: '+91 22 2832 9900',
    hours: 'Mon-Sat: 8:00 AM – 7:00 PM',
    acceptedStreams: ['plastic', 'metal', 'wood', 'cardboard'],
    acceptedLabels: ['HDPE Buckets', 'Metal Offcuts', 'Pallet Planks', 'Cartons'],
    rating: '4.8 ★',
    verified: true,
    capacityStatus: 'Accepting Batches',
    notes: 'Heavy commercial scrap intake with automated material sorting.'
  },
  {
    id: 'mum-3',
    name: 'Dadar GreenLoop Community Drop Station',
    city: 'Mumbai',
    lat: 19.0178,
    lng: 72.8398,
    address: 'Senapati Bapat Marg, Dadar West, Mumbai, Maharashtra 400028',
    distance: '3.3 km',
    distanceKm: 3.3,
    phone: '+91 22 2430 7744',
    hours: 'Mon-Sat: 9:00 AM – 6:30 PM',
    acceptedStreams: ['glass', 'cardboard', 'metal'],
    acceptedLabels: ['Glass Jars', 'Corrugated Sheets', 'Scrap Hardware'],
    rating: '4.7 ★',
    verified: true,
    capacityStatus: 'Accepting Batches',
    notes: 'Walk-in friendly depot. Accepts small batch creative drop-offs.'
  },

  // Pune
  {
    id: 'pune-1',
    name: 'Kothrud Material Reclamation Point',
    city: 'Pune',
    lat: 18.5074,
    lng: 73.8077,
    address: 'Paud Rd, Ideal Colony, Kothrud, Pune, Maharashtra 411038',
    distance: '1.9 km',
    distanceKm: 1.9,
    phone: '+91 20 2544 1122',
    hours: 'Mon-Sat: 9:00 AM – 7:00 PM',
    acceptedStreams: ['wood', 'metal', 'cardboard'],
    acceptedLabels: ['Pine Timber', 'Steel & Aluminum', 'Packing Boxes'],
    rating: '4.8 ★',
    verified: true,
    capacityStatus: 'Accepting Batches',
    notes: 'Partnered with regional woodworking apprentices and artisan workshops.'
  },
  {
    id: 'pune-2',
    name: 'Viman Nagar Green Resource Hub',
    city: 'Pune',
    lat: 18.5679,
    lng: 73.9143,
    address: 'Symbiosis Rd, Viman Nagar, Pune, Maharashtra 411014',
    distance: '4.2 km',
    distanceKm: 4.2,
    phone: '+91 20 2663 4400',
    hours: 'Daily: 8:30 AM – 8:00 PM',
    acceptedStreams: ['electronics', 'glass', 'textile', 'plastic'],
    acceptedLabels: ['E-Waste', 'Glass Jars', 'Fabric Scraps', 'Containers'],
    rating: '4.9 ★',
    verified: true,
    capacityStatus: 'Accepting Batches',
    notes: 'Student drop-off discounts & carbon credits issued instantly.'
  },

  // Delhi NCR
  {
    id: 'del-1',
    name: 'Okhla Clean Streams Depot',
    city: 'Delhi',
    lat: 28.5355,
    lng: 77.2732,
    address: 'Okhla Industrial Area Phase III, New Delhi, Delhi 110020',
    distance: '3.6 km',
    distanceKm: 3.6,
    phone: '+91 11 2681 5566',
    hours: 'Mon-Sat: 8:00 AM – 6:00 PM',
    acceptedStreams: ['metal', 'plastic', 'cardboard', 'wood'],
    acceptedLabels: ['Industrial Metals', 'Rigid Plastics', 'Heavy Boxes', 'Pallets'],
    rating: '4.8 ★',
    verified: true,
    capacityStatus: 'Accepting Batches',
    notes: 'Direct circular transfer facility for industrial and commercial surplus.'
  },
  {
    id: 'del-2',
    name: 'Gurugram Circular Station',
    city: 'Delhi',
    lat: 28.4682,
    lng: 77.0632,
    address: 'Sector 29, City Centre, Gurugram, Haryana 122002',
    distance: '6.1 km',
    distanceKm: 6.1,
    phone: '+91 124 405 8899',
    hours: 'Daily: 9:00 AM – 8:00 PM',
    acceptedStreams: ['cardboard', 'electronics', 'textile', 'glass'],
    acceptedLabels: ['Shipping Boxes', 'E-Waste', 'Textiles', 'Beverage Bottles'],
    rating: '4.9 ★',
    verified: true,
    capacityStatus: 'Accepting Batches',
    notes: 'Equipped with barcode receipting and instant circular impact tracking.'
  },

  // Hyderabad
  {
    id: 'hyd-1',
    name: 'HITEC City Resource Station',
    city: 'Hyderabad',
    lat: 17.4474,
    lng: 78.3762,
    address: 'Hitech City Rd, Madhapur, Hyderabad, Telangana 500081',
    distance: '2.8 km',
    distanceKm: 2.8,
    phone: '+91 40 2311 6677',
    hours: 'Mon-Sat: 9:00 AM – 7:30 PM',
    acceptedStreams: ['electronics', 'cardboard', 'plastic', 'metal'],
    acceptedLabels: ['Tech E-Scrap', 'Packaging Paper', 'Clean Polymers', 'Metals'],
    rating: '4.9 ★',
    verified: true,
    capacityStatus: 'Accepting Batches',
    notes: 'Zero-landfill certified station with high-volume digital weighing.'
  }
];

const CITIES = ['All Cities', 'Bengaluru', 'Mumbai', 'Pune', 'Delhi', 'Hyderabad'];

const STREAM_FILTERS = [
  { id: 'all', label: 'All Materials' },
  { id: 'cardboard', label: 'Cardboard & Paper' },
  { id: 'wood', label: 'Timber & Pallets' },
  { id: 'glass', label: 'Glass Containers' },
  { id: 'metal', label: 'Scrap Metals' },
  { id: 'plastic', label: 'Plastics' },
  { id: 'textile', label: 'Textiles' },
  { id: 'electronics', label: 'E-Waste' },
];

export default function DisposalCentersModal({ isOpen, onClose, userCity = 'Bengaluru' }) {
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [selectedStream, setSelectedStream] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenterId, setSelectedCenterId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [mobileTab, setMobileTab] = useState('map'); // 'map' or 'list'
  const [mapProviderMode, setMapProviderMode] = useState('osm-interactive'); // 'osm-interactive' or 'osm-in-portal'

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);

  // Sync initial city from props
  useEffect(() => {
    if (userCity && CITIES.includes(userCity)) {
      setSelectedCity(userCity);
    }
  }, [userCity]);

  // Filter centers based on city, stream, and query
  const filteredCenters = useMemo(() => {
    return DISPOSAL_CENTERS.filter((c) => {
      // City filter
      if (selectedCity !== 'All Cities' && c.city !== selectedCity) return false;
      // Stream filter
      if (selectedStream !== 'all' && !c.acceptedStreams.includes(selectedStream)) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesAddress = c.address.toLowerCase().includes(q);
        const matchesStream = c.acceptedLabels.some((label) => label.toLowerCase().includes(q));
        if (!matchesName && !matchesAddress && !matchesStream) return false;
      }
      return true;
    });
  }, [selectedCity, selectedStream, searchQuery]);

  // Selected center object
  const selectedCenter = useMemo(() => {
    if (!selectedCenterId) return filteredCenters[0] || DISPOSAL_CENTERS[0];
    return DISPOSAL_CENTERS.find((c) => c.id === selectedCenterId) || filteredCenters[0];
  }, [selectedCenterId, filteredCenters]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Small delay to ensure modal DOM is mounted and painted
    const initTimer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const defaultCenter = selectedCenter || DISPOSAL_CENTERS[0];
      const initialCoords = [defaultCenter.lat, defaultCenter.lng];

      const map = L.map(mapContainerRef.current, {
        center: initialCoords,
        zoom: 13,
        zoomControl: false,
      });

      // OpenStreetMap India compliant tiles via OpenStreetMap standard server
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.in/" target="_blank" rel="noopener noreferrer">OpenStreetMap India</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19,
      }).addTo(map);

      // Add zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;

      // Trigger size invalidation after layout stabilizes
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = {};
    };
  }, [isOpen]);

  // Update Markers on Map when filtered centers or selected center changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (filteredCenters.length === 0) return;

    const bounds = L.latLngBounds();

    filteredCenters.forEach((center) => {
      const isSelected = selectedCenter?.id === center.id;
      const coords = [center.lat, center.lng];
      bounds.extend(coords);

      const markerHtml = `
        <div class="relative group cursor-pointer transition-transform duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          ${isSelected ? '<div class="absolute -inset-2 rounded-full bg-[#3EA635]/40 animate-ping"></div>' : ''}
          <div class="w-10 h-10 rounded-2xl ${
            isSelected 
              ? 'bg-[#3EA635] text-white shadow-[0_8px_20px_rgba(62,166,53,0.5)] ring-2 ring-white' 
              : 'bg-[#0B3B24] text-white shadow-lg hover:bg-[#125838]'
          } flex items-center justify-center transition-all">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: markerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; width: 280px; padding: 14px 16px; background: #ffffff;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="background: #EAF5ED; color: #0B3B24; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">
              Verified Depot
            </span>
            <span style="font-size: 11px; font-weight: bold; color: #3EA635;">${center.rating}</span>
          </div>
          <div style="font-weight: 800; font-size: 14px; color: #1A261D; line-height: 1.25; margin-bottom: 6px;">
            ${center.name}
          </div>
          <div style="font-size: 11px; color: #586A5E; margin-bottom: 8px; line-height: 1.35;">
            ${center.address}
          </div>
          <div style="background: #F9FAF8; border-radius: 10px; padding: 6px 8px; margin-bottom: 10px; font-size: 10.5px; color: #2C3A30;">
            <strong style="color: #0B3B24;">Accepts:</strong> ${center.acceptedLabels.slice(0, 3).join(', ')}
          </div>
          <div style="display: flex; gap: 6px;">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}"
              target="_blank"
              rel="noopener noreferrer"
              style="flex: 1; text-align: center; background: #0B3B24; color: #ffffff; font-size: 11px; font-weight: bold; padding: 8px 8px; border-radius: 10px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"
            >
              <span>Directions</span>
              <span>&rarr;</span>
            </a>
            <a 
              href="https://www.openstreetmap.in/#16/${center.lat}/${center.lng}"
              target="_blank"
              rel="noopener noreferrer"
              style="flex: 1; text-align: center; background: #EAF5ED; color: #0B3B24; border: 1px solid #CEEAD8; font-size: 11px; font-weight: bold; padding: 8px 8px; border-radius: 10px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 4px;"
            >
              <span>OSM.in ↗</span>
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedCenterId(center.id);
      });

      markersRef.current[center.id] = marker;
    });

    // Auto-fit bounds if multiple centers and no explicit center is selected
    if (filteredCenters.length > 1 && !selectedCenterId) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [filteredCenters, selectedCenter?.id]);

  // Fly to selected center when chosen from list
  const handleSelectCenter = (center) => {
    setSelectedCenterId(center.id);
    setMobileTab('map');

    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([center.lat, center.lng], 15, {
        duration: 1.2,
        easeLinearity: 0.25,
      });

      setTimeout(() => {
        const marker = markersRef.current[center.id];
        if (marker) {
          marker.openPopup();
        }
      }, 600);
    }
  };

  // User Geolocation Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const map = mapInstanceRef.current;
        if (map) {
          // Remove old user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          const userIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `
              <div class="relative flex items-center justify-center">
                <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></span>
                <div class="relative w-5 h-5 rounded-full bg-[#0B3B24] border-2 border-white shadow-xl flex items-center justify-center">
                  <div class="w-2 h-2 rounded-full bg-[#A3E5B9]"></div>
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('<strong style="font-size:12px;color:#0B3B24;">You are here</strong>')
            .openPopup();

          map.flyTo([latitude, longitude], 14, { duration: 1.2 });
        }
      },
      (err) => {
        setLocating(false);
        alert('Could not retrieve your location. Please check browser permissions.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 lg:p-6 animate-in fade-in duration-200">
      
      <div className="bg-[#FAFBF9] rounded-[28px] sm:rounded-[36px] w-full max-w-6xl h-[92vh] sm:h-[88vh] shadow-2xl border border-gray-100 flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* ========================================================= */}
        {/* 1. TOP HEADER BAR                                         */}
        {/* ========================================================= */}
        <div className="px-5 sm:px-7 py-4 bg-white border-b border-gray-100 flex items-center justify-between gap-4 shrink-0">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EAF5ED] text-[#0B3B24] flex items-center justify-center shrink-0 border border-[#D5EEDB] shadow-sm">
              <MapPin className="w-5 h-5 text-[#0B3B24]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1A261D] tracking-tight">
                  Verified Material Drop &amp; Disposal Centers
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF5ED] text-[#0B3B24] border border-[#D5EEDB]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3EA635]" />
                  <span>{filteredCenters.length} Hubs Found</span>
                </span>
              </div>
              <p className="text-xs text-[#586A5E] hidden sm:block">
                Interactive spatial visualization for circular scrap diversion, studio drop-offs &amp; clean reuse
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* OpenStreetMap.in Portal Direct Link */}
            <a
              href={`https://www.openstreetmap.in/#14/${selectedCenter?.lat || 12.9352}/${selectedCenter?.lng || 77.6245}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EAF5ED] hover:bg-[#D5EEDB] text-[#0B3B24] border border-[#CEEAD8] text-xs font-bold transition-all shadow-sm"
              title="Open full interactive map on openstreetmap.in"
            >
              <Globe className="w-3.5 h-3.5 text-[#3EA635]" />
              <span>openstreetmap.in ↗</span>
            </a>

            {/* Locate Me Button */}
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={locating}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-[#EAF5ED] text-[#1A261D] hover:text-[#0B3B24] text-xs font-bold transition-all disabled:opacity-50"
              title="Detect my current location"
            >
              <Compass className={`w-3.5 h-3.5 text-[#0B3B24] ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? 'Locating...' : 'Near Me'}</span>
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-[#1A261D] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

        </div>

        {/* Mobile Tab Switcher (List vs Map) */}
        <div className="sm:hidden px-4 py-2 bg-[#F4F6F0] border-b border-gray-200 flex items-center justify-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold text-center transition-all ${
              mobileTab === 'map' ? 'bg-[#0B3B24] text-white shadow-sm' : 'bg-white text-gray-600'
            }`}
          >
            🗺️ Interactive Map
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold text-center transition-all ${
              mobileTab === 'list' ? 'bg-[#0B3B24] text-white shadow-sm' : 'bg-white text-gray-600'
            }`}
          >
            📋 Center Directory ({filteredCenters.length})
          </button>
        </div>

        {/* ========================================================= */}
        {/* 2. MAIN BODY: SPLIT VIEW (LIST PANEL + MAP VISUALIZATION) */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden relative">
          
          {/* ========================================================= */}
          {/* LEFT PANEL: FILTERS, SEARCH & DIRECTORY                   */}
          {/* ========================================================= */}
          <div 
            className={`
              w-full sm:w-[380px] lg:w-[420px] bg-white border-r border-gray-100 flex flex-col shrink-0
              ${mobileTab === 'list' ? 'flex' : 'hidden sm:flex'}
            `}
          >
            
            {/* Search and City Selectors */}
            <div className="p-4 border-b border-gray-100 space-y-3 bg-[#FAFBF9]/80">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#586A5E] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hub name, address, or material..."
                  className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#1A261D] placeholder-[#586A5E]/70 focus:outline-none focus:border-[#0B3B24] focus:ring-1 focus:ring-[#0B3B24] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* City Pill Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setSelectedCity(city);
                      setSelectedCenterId(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCity === city
                        ? 'bg-[#0B3B24] text-white shadow-sm'
                        : 'bg-white text-[#586A5E] border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              {/* Stream Type Filter */}
              <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-[11px] font-bold text-[#586A5E] uppercase tracking-wider flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#0B3B24]" />
                  <span>Material Stream:</span>
                </span>
                <select
                  value={selectedStream}
                  onChange={(e) => setSelectedStream(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-[#1A261D] focus:outline-none focus:border-[#0B3B24]"
                >
                  {STREAM_FILTERS.map((sf) => (
                    <option key={sf.id} value={sf.id}>{sf.label}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Centers Directory List */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
              {filteredCenters.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1A261D]">No Centers Found</h4>
                  <p className="text-xs text-[#586A5E]">
                    Try clearing your search query or selecting "All Cities".
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity('All Cities');
                      setSelectedStream('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0B3B24] text-white text-xs font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredCenters.map((center) => {
                  const isSelected = selectedCenter?.id === center.id;
                  return (
                    <div
                      key={center.id}
                      onClick={() => handleSelectCenter(center)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 text-xs ${
                        isSelected
                          ? 'bg-[#EAF5ED]/60 border-[#0B3B24] shadow-md ring-1 ring-[#0B3B24]/20'
                          : 'bg-white border-gray-200/90 hover:border-gray-300 hover:bg-[#FAFBF9] shadow-2xs'
                      }`}
                    >
                      {/* Top Row: Name and Proximity */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#1A261D] text-sm leading-tight hover:text-[#0B3B24] transition-colors">
                              {center.name}
                            </span>
                            {center.verified && (
                              <span title="GreenLoop Verified Drop Center">
                                <ShieldCheck className="w-4 h-4 text-[#3EA635] inline shrink-0" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#586A5E] leading-relaxed line-clamp-1">
                            {center.address}
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full bg-[#EAF5ED] text-[#0B3B24] text-[10px] font-extrabold shrink-0">
                          {center.distance}
                        </span>
                      </div>

                      {/* Accepted Material Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {center.acceptedLabels.map((lbl, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#F4F6F0] text-[#2C3A30] text-[10.5px] font-medium border border-gray-200/60"
                          >
                            {lbl}
                          </span>
                        ))}
                      </div>

                      {/* Operating Hours and Actions */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#586A5E]">
                        <span className="flex items-center gap-1 truncate">
                          <Clock className="w-3 h-3 text-[#0B3B24] shrink-0" />
                          <span className="truncate">{center.hours.split('(')[0]}</span>
                        </span>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-[#0B3B24] hover:underline flex items-center gap-0.5"
                          >
                            <span>Directions</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Panel Summary */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between text-[11px] text-[#586A5E]">
              <span>Operating circular drop hubs</span>
              <span className="font-bold text-[#0B3B24]">{filteredCenters.length} stations ready</span>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT PANEL: INTERACTIVE OPENSTREETMAP VISUALIZATION       */}
          {/* ========================================================= */}
          <div 
            className={`
              flex-1 h-full relative overflow-hidden bg-[#EAECE4]
              ${mobileTab === 'map' ? 'flex' : 'hidden sm:flex'}
            `}
          >
            
            {/* Map Mode Switcher Top Bar */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
              <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-gray-100 flex items-center text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMapProviderMode('osm-interactive');
                    setTimeout(() => {
                      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
                    }, 100);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    mapProviderMode === 'osm-interactive'
                      ? 'bg-[#0B3B24] text-white shadow-sm'
                      : 'text-[#586A5E] hover:text-[#1A261D]'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Marked Depots (OSM)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapProviderMode('osm-in-portal')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    mapProviderMode === 'osm-in-portal'
                      ? 'bg-[#0B3B24] text-white shadow-sm'
                      : 'text-[#586A5E] hover:text-[#1A261D]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-[#3EA635]" />
                  <span>openstreetmap.in Portal</span>
                </button>
              </div>

              {/* Direct Open in New Tab Button */}
              <a
                href={`https://www.openstreetmap.in/#14/${selectedCenter?.lat || 12.9352}/${selectedCenter?.lng || 77.6245}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center gap-1 px-3 py-2 rounded-2xl bg-white/95 hover:bg-white text-[#0B3B24] border border-gray-200/80 shadow-md text-xs font-bold transition-all"
                title="Open directly on openstreetmap.in"
              >
                <span>Full Screen OSM.in</span>
                <ExternalLink className="w-3 h-3 text-[#3EA635]" />
              </a>
            </div>

            {/* View A: Leaflet OSM Map with Marked Pins */}
            <div 
              ref={mapContainerRef}
              className={`w-full h-full z-0 ${mapProviderMode === 'osm-interactive' ? 'block' : 'hidden'}`}
              style={{ minHeight: '100%' }}
            />

            {/* View B: Live Embed from https://www.openstreetmap.in/ */}
            {mapProviderMode === 'osm-in-portal' && (
              <div className="w-full h-full z-0 pt-14 sm:pt-16 bg-[#0f172a] relative">
                <iframe
                  title="OpenStreetMap India Community Portal"
                  src={`https://www.openstreetmap.in/#14/${selectedCenter?.lat || 12.9352}/${selectedCenter?.lng || 77.6245}`}
                  className="w-full h-full border-0"
                  allow="geolocation; fullscreen; accelerometer; gyroscope; magnetometer"
                />
              </div>
            )}

            {/* Floating Map Overlay: Active Center Card Details */}
            {selectedCenter && (
              <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:max-w-md z-10 bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-gray-100/90 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EAF5ED] text-[#0B3B24] text-[10px] font-bold uppercase tracking-wider">
                        {selectedCenter.city} Hub
                      </span>
                      <span className="text-xs font-bold text-[#3EA635]">
                        {selectedCenter.rating}
                      </span>
                      <span className="text-[11px] text-[#586A5E]">
                        • {selectedCenter.capacityStatus}
                      </span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#1A261D] mt-1 leading-snug">
                      {selectedCenter.name}
                    </h3>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.lat},${selectedCenter.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#0B3B24] text-white hover:bg-[#125838] shadow-sm transition-all shrink-0"
                    title="Get Turn-by-Turn Directions"
                  >
                    <Navigation className="w-4 h-4" />
                  </a>
                </div>

                <div className="text-xs text-[#586A5E] leading-relaxed">
                  {selectedCenter.address}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedCenter.acceptedLabels.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-[#F4F6F0] text-[#0B3B24] text-[10.5px] font-semibold border border-gray-200"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <a
                    href={`tel:${selectedCenter.phone}`}
                    className="font-bold text-[#2C3A30] hover:text-[#0B3B24] flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#0B3B24]" />
                    <span>{selectedCenter.phone}</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.openstreetmap.in/#16/${selectedCenter.lat}/${selectedCenter.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#EAF5ED] text-[#0B3B24] font-bold border border-[#CEEAD8] hover:bg-[#D5EEDB] transition-colors text-xs"
                      title="View directly on OpenStreetMap India"
                    >
                      <span>OSM.in</span>
                      <ExternalLink className="w-3 h-3 text-[#3EA635]" />
                    </a>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.lat},${selectedCenter.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B3B24] text-white font-bold hover:bg-[#125838] transition-colors shadow-sm text-xs"
                    >
                      <span>Navigate</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

              </div>
            )}

            {/* Floating Attribution Banner */}
            <div className="absolute bottom-2 right-2 z-10 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] text-gray-600 border border-gray-200/60 shadow-sm pointer-events-auto">
              Map data &copy; <a href="https://www.openstreetmap.in/" target="_blank" rel="noopener noreferrer" className="font-bold text-[#0B3B24] hover:underline">OpenStreetMap India</a> &bull; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline">ODbL</a>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
