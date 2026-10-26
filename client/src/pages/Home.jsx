import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchListings } from '../api/listings.api';
import { fetchHealthStatus } from '../api/health.api';
import ListingCard from '../components/ListingCard';
import { 
  Leaf, 
  Sparkles, 
  ArrowRight, 
  ArrowUpRight, 
  MapPin, 
  Star, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Package, 
  TreePine, 
  Wine, 
  Scissors, 
  Box, 
  Layers, 
  Heart,
  Quote
} from 'lucide-react';

export default function Home() {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [latency, setLatency] = useState(null);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const { isAuthenticated, isDonor } = useAuth();

  // Load backend health and live listings
  useEffect(() => {
    const init = async () => {
      // 1. Health probe
      const start = performance.now();
      try {
        const h = await fetchHealthStatus();
        setLatency(Math.round(performance.now() - start));
        setHealthData(h);
        setConnectionStatus('connected');
      } catch (err) {
        setConnectionStatus('error');
      }

      // 2. Fetch real active listings from PostgreSQL
      try {
        const res = await fetchListings({ limit: 4, page: 1 });
        if (res.success && res.listings?.length > 0) {
          setFeaturedListings(res.listings);
        }
      } catch (err) {
        console.warn('Could not load live listings for home page showcase.');
      }
    };

    init();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (subscribeEmail.trim()) {
      setEmailSubscribed(true);
      setTimeout(() => setEmailSubscribed(false), 5000);
      setSubscribeEmail('');
    }
  };

  // Fallback curated showcase items if DB is still seeding
  const defaultShowcaseItems = [
    {
      id: 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      title: 'Clean Heavy-Duty Corrugated Shipping Boxes',
      material_category: 'cardboard',
      material_type: 'Double-Wall Boxes',
      condition: 'Like New',
      quantity_description: '45 large boxes',
      city: 'Bengaluru',
      image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
      status: 'available',
      description: 'Clean flattened brown shipping boxes from electronics delivery. Tape removed, moisture-free.',
    },
    {
      id: 'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      title: 'Solid Pine Pallet Wood Planks & Blocks',
      material_category: 'wood',
      material_type: 'Untreated Pine',
      condition: 'Good',
      quantity_description: '18 dismantled planks',
      city: 'Bengaluru',
      image_url: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=800&auto=format&fit=crop&q=80',
      status: 'available',
      description: 'Heat-treated chemical-free pine pallet planks. Nails removed, perfect for student planters.',
    },
    {
      id: 'a3333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      title: 'Clear Sanitized Glass Food Jars with Lids',
      material_category: 'glass',
      material_type: 'Mason & Jam Jars',
      condition: 'Like New',
      quantity_description: '36 assorted jars',
      city: 'Mumbai',
      image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
      status: 'available',
      description: 'Sterilized glass jars with airtight twist lids. Suitable for soy candle making or seed saving.',
    },
    {
      id: 'a4444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      title: 'Heavyweight Denim & Cotton Fabric Rolls',
      material_category: 'textile',
      material_type: 'Denim Offcuts',
      condition: 'Like New',
      quantity_description: '15 kg bundled rolls',
      city: 'Bengaluru',
      image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
      status: 'available',
      description: 'Dark indigo denim offcuts from boutique tailor. Clean selvage edges ideal for accessories.',
    },
  ];

  const showcaseListings = featuredListings.length > 0 ? featuredListings : defaultShowcaseItems;

  const categories = [
    {
      title: 'Cardboard & Paper',
      exploreName: 'Explore CardboardEco',
      desc: 'Moving boxes, tubes, packaging cartons',
      img: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
      filter: 'cardboard'
    },
    {
      title: 'Wood & Timber',
      exploreName: 'Explore TimberCraft',
      desc: 'Heat-treated pallets, pine battens, planks',
      img: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=800&auto=format&fit=crop&q=80',
      filter: 'wood'
    },
    {
      title: 'Glass Containers',
      exploreName: 'Explore NatureGlass',
      desc: 'Sanitized food jars, beverage bottles, vials',
      img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
      filter: 'glass'
    },
    {
      title: 'Textiles & Scraps',
      exploreName: 'Explore FabricRemnants',
      desc: 'Denim rolls, cotton bolts, tailoring offcuts',
      img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
      filter: 'textile'
    }
  ];

  const galleryItems = [
    {
      title: 'Architectural Scale Model',
      material: 'Warehouse Corrugated Cardboard',
      maker: 'Ananya Iyer • Architecture BCS Student',
      img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Grain Slice Board Duo',
      material: 'Untreated Pine Pallet Offcuts',
      maker: 'Ramesh Woodcrafts • Artisan Studio',
      img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Eco Bamboo & Utensil Holder',
      material: 'Salvaged Hardwood Blocks',
      maker: 'GreenHome Studio • Circular Maker',
      img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Soy Wax Hand-Poured Candle',
      material: 'Sanitized Glass Preserve Jars',
      maker: 'Priya Studio • Eco Candlemaker',
      img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Upcycled Denim Workshop Apron',
      material: 'Tailor Denim Offcuts',
      maker: 'Urban Stitchers NGO • Vocational Guild',
      img: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const reviews = [
    {
      quote: "ReSource AI's cardboard boxes and timber offcuts are a blessing for architecture students. Immediate local coordination and zero landfill waste!",
      author: "Jane Cooper",
      role: "Architecture Student & Maker",
      rating: 5
    },
    {
      quote: "Fantastic materials and clean pickup timelines. Our NGO student workshops feel so much more sustainable and affordable without buying new plastic.",
      author: "Darlene Robertson",
      role: "Director, EcoArts Foundation",
      rating: 5
    },
    {
      quote: "Love the explainable AI recommendations! The engine correctly identified that our studio needed sanitized glass jars and alerted us right away.",
      author: "Jacob Jones",
      role: "Sustainable Artisan & Food Blogger",
      rating: 5
    },
    {
      quote: "The denim and canvas remnants were clean, sorted, and ready to stitch. Diverted over 80kg of cloth in a single month of student projects.",
      author: "Esther Howard",
      role: "Textile Upcycling Guild Lead",
      rating: 5
    }
  ];

  return (
    <div className="bg-[#FAF7F2] text-[#1C241E] min-h-screen">
      
      {/* 1. HERO SECTION — Styled directly after Image 1 (top) */}
      <section className="px-4 sm:px-6 lg:px-8 pt-4 pb-12 sm:pb-20 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] flex items-center shadow-luxury">
          
          {/* Ambient Workshop Photography Background */}
          <img
            src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1800&q=85"
            alt="Warm sustainable workshop with clean reusable materials"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Warm Dark Gradient Overlay for optimal editorial legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#12291E]/90 via-[#1B3B2B]/75 to-transparent sm:to-[#1B3B2B]/30" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl px-6 sm:px-12 lg:px-16 py-12 text-white space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[#E2EBD8] text-xs font-semibold tracking-wide">
              <Leaf className="w-3.5 h-3.5 text-[#A3B899]" />
              AI-Powered Waste-to-Resource Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1] tracking-tight">
              Eco-Friendly <br />
              <span className="font-serif italic font-normal text-[#E2EBD8]">Clean Materials</span> for <br />
              a greener world
            </h1>

            <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed max-w-lg">
              The waste-to-resource platform connecting households, workshops, and packaging centers offering clean discarded cardboard, timber, and glass directly to makers, students, and NGOs.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-[#1B3B2B] hover:bg-[#E2EBD8] shadow-md transition-all hover:scale-105 active:scale-95"
              >
                Explore Materials
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {isDonor ? (
                <Link
                  to="/create-listing"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-transparent border border-white/40 text-white hover:bg-white/10 transition-all"
                >
                  Post Surplus
                </Link>
              ) : (
                <Link
                  to="/recommendations"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E2EBD8]" />
                  AI Matcher
                </Link>
              )}
            </div>

          </div>

          {/* Floating Metric Badge (Bottom right glass card from Image 1) */}
          <div className="hidden sm:block absolute bottom-8 right-8 z-10 p-5 rounded-3xl bg-white/15 backdrop-blur-md border border-white/30 text-white shadow-2xl max-w-xs animate-in fade-in duration-500">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-3xl font-serif font-bold text-white">96%</div>
                <div className="text-xs text-[#E2EBD8] font-medium mt-0.5">Community Resource Diversion</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-[#E2EBD8]" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-[10px] text-white/80 font-medium tracking-wide">
              <span>Natural</span>
              <span>•</span>
              <span>Non-Toxic</span>
              <span>•</span>
              <span>Explainable AI</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FEATURED PRODUCTS / BESTSELLING SURPLUS SECTION — Inspired by Image 1 "Eco Essentials Planet-Friendly ◇ Bestselling Products" */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-16 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#E8E2D6]">
          <div>
            <div className="text-xs uppercase font-semibold tracking-widest text-[#76937F] mb-1">
              Eco Essentials Planet-Friendly
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1C241E]">
              Bestselling <span className="font-serif italic font-normal text-[#76937F]">◇ Materials</span>
            </h2>
          </div>

          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B3B2B] hover:text-[#28533E] group"
          >
            <span>More products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Tall Luxury Cards Grid matching Image 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {showcaseListings.slice(0, 4).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

      </section>

      {/* 3. FULL-WIDTH EDITORIAL STORY BANNER — Styled directly after Image 1 (middle wide kitchen banner) */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden min-h-[380px] sm:min-h-[420px] flex items-end shadow-luxury">
          
          <img
            src="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=80"
            alt="Eco friendly kitchen and circular workshop"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#12291E]/95 via-[#1B3B2B]/60 to-transparent" />

          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl text-white space-y-4">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium leading-snug text-white">
              We curate clean surplus materials you can trust for years to come — through everyday student workshops, artisan studios, and evolving sustainable lifestyles.
            </h3>
            <p className="text-xs uppercase tracking-widest text-[#E2EBD8] font-semibold">
              Each piece is thoughtfully salvaged with zero harmful chemicals
            </p>
          </div>

        </div>
      </section>

      {/* 4. TRIO BENEFIT PILLS — Styled directly after Image 1 (Natural Finish, Eco Innovation, Sustainable Materials) */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#E8E2D6] shadow-sm flex items-center justify-center gap-3.5 text-center group hover:bg-[#F2ECE1] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#E2EBD8] text-[#1B3B2B] flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5 text-[#2D5A3E]" />
            </div>
            <div className="text-left">
              <div className="font-serif font-bold text-sm text-[#1C241E]">Natural Finish</div>
              <div className="text-[11px] text-[#5D6E62]">Clean, non-toxic reusable discards</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#E8E2D6] shadow-sm flex items-center justify-center gap-3.5 text-center group hover:bg-[#F2ECE1] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#E2EBD8] text-[#1B3B2B] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#2D5A3E]" />
            </div>
            <div className="text-left">
              <div className="font-serif font-bold text-sm text-[#1C241E]">Eco Innovation</div>
              <div className="text-[11px] text-[#5D6E62]">Explainable 100-pt AI match scoring</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#E8E2D6] shadow-sm flex items-center justify-center gap-3.5 text-center group hover:bg-[#F2ECE1] transition-all">
            <div className="w-10 h-10 rounded-full bg-[#E2EBD8] text-[#1B3B2B] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#2D5A3E]" />
            </div>
            <div className="text-left">
              <div className="font-serif font-bold text-sm text-[#1C241E]">Sustainable Materials</div>
              <div className="text-[11px] text-[#5D6E62]">100% diverted from city landfills</div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. CATEGORIES SHOWCASE — Styled directly after Image 1 bottom ("Explore our thoughtful and planet-first ◇ Categories") */}
      <section id="categories" className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 max-w-7xl mx-auto">
        
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <div className="text-xs uppercase font-semibold tracking-widest text-[#76937F]">
            Explore our thoughtful and planet-first
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C241E]">
            Categories <span className="font-serif italic font-normal text-[#76937F]">◇ Reusable Discards</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/browse?category=${cat.filter}`}
              className="group relative rounded-3xl overflow-hidden aspect-[3/4] flex flex-col justify-end p-6 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={cat.img}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#12291E]/95 via-[#1B3B2B]/40 to-transparent" />

              <div className="relative z-10 text-white space-y-3">
                <div>
                  <div className="text-xs text-[#E2EBD8] uppercase tracking-wider font-semibold">
                    {cat.title}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white mt-0.5">
                    {cat.exploreName}
                  </h3>
                  <p className="text-[11px] text-white/70 line-clamp-1 mt-1">
                    {cat.desc}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30 group-hover:bg-white group-hover:text-[#1B3B2B] transition-all">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </section>

      {/* 6. INSPIRATION CIRCULAR GALLERY — Styled directly after Image 2 (top gallery) */}
      <section id="gallery" className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-[#F4EFEA] border-y border-[#E8E2D6]">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase font-semibold tracking-widest text-[#76937F] mb-1">
                Thoughtful, Planet-Prioritizing Ideas
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C241E]">
                Inspiration <span className="font-serif italic font-normal text-[#76937F]">◇ Circular Gallery</span>
              </h2>
            </div>
            <p className="text-xs text-[#5D6E62] max-w-sm">
              Real creations fabricated by students, makers, and artisans using reclaimed materials from ReSource AI donors.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {galleryItems.map((item, idx) => (
              <div
                key={idx}
                className="group rounded-2xl overflow-hidden bg-white border border-[#E8E2D6] shadow-sm flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#EFE9DF]">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3.5 space-y-1">
                  <h4 className="text-xs font-serif font-bold text-[#1C241E] line-clamp-1">
                    {item.title}
                  </h4>
                  <div className="text-[10px] text-[#76937F] font-medium line-clamp-1">
                    {item.material}
                  </div>
                  <div className="text-[10px] text-[#5D6E62] pt-1 line-clamp-1 border-t border-[#E8E2D6]/60">
                    {item.maker}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. REVIEWS & COMMUNITY IMPACT — Styled directly after Image 2 (middle rating and review cards) */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-7xl mx-auto space-y-12">
        
        {/* Rating Header */}
        <div className="p-8 rounded-3xl bg-[#E2EBD8]/40 border border-[#D5E4C8] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl font-serif font-bold text-[#1B3B2B]">4.9<span className="text-2xl text-[#76937F]">/5</span></div>
            <div>
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-xs font-bold text-[#1C241E] mt-1">
                More than 25,000 kg Reused
              </div>
              <div className="text-[11px] text-[#5D6E62]">
                5-Star Community Verified Waste Diversions
              </div>
            </div>
          </div>

          <div className="text-xs text-[#5D6E62] text-center sm:text-right max-w-xs">
            Connecting conscientious donors with vocational schools, makerspaces, and eco-conscious creators across India.
          </div>
        </div>

        {/* 4 Review Cards with Quotes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-[#E8E2D6] shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <Quote className="w-7 h-7 text-[#76937F]/60" />
                <p className="text-xs text-[#1C241E] leading-relaxed font-normal">
                  "{rev.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8E2D6]">
                <div className="text-xs font-serif font-bold text-[#1C241E]">
                  {rev.author}
                </div>
                <div className="text-[10px] text-[#76937F]">
                  {rev.role}
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* 8. DARK FOREST GREEN COMMUNITY BANNER — Styled directly after Image 2 (bottom green card) */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="rounded-4xl bg-[#1B3B2B] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          
          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#E2EBD8] text-xs font-medium">
              <Leaf className="w-3.5 h-3.5" />
              Circular Waste Movement
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
              Join the Circular Network — <br />
              <span className="font-serif italic font-normal text-[#E2EBD8]">100% Waste Diverted</span>, Zero Landfill
            </h2>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg">
              Get notified when fresh surplus batches of cardboard, timber, textiles, and glass appear in your city.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md pt-2">
              <input
                type="email"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                placeholder="Enter your email..."
                required
                className="flex-1 px-5 py-3 rounded-full bg-white/15 border border-white/20 text-white placeholder-white/60 text-xs focus:bg-white focus:text-[#1C241E] focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-[#FAF7F2] text-[#1B3B2B] text-xs font-bold uppercase tracking-wider hover:bg-[#E2EBD8] transition-all hover:scale-105 active:scale-95"
              >
                Join Now ↗
              </button>
            </form>

            {emailSubscribed && (
              <div className="text-xs text-[#E2EBD8] flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#E2EBD8]" />
                <span>Thank you for joining our circular waste community!</span>
              </div>
            )}
          </div>

          {/* Subdued Background Logo Motif */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
            <Leaf className="w-96 h-96 text-white" />
          </div>

        </div>
      </section>

      {/* 9. EDITORIAL LUXURY FOOTER — Styled directly after Image 2 bottom */}
      <footer className="px-4 sm:px-6 lg:px-8 pt-16 pb-12 border-t border-[#E8E2D6] bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1C241E]">Surplus Streams</h4>
              <ul className="space-y-2 text-[#5D6E62]">
                <li><Link to="/browse?category=cardboard" className="hover:text-[#1B3B2B]">Cardboard &amp; Packaging</Link></li>
                <li><Link to="/browse?category=wood" className="hover:text-[#1B3B2B]">Untreated Pine &amp; Timber</Link></li>
                <li><Link to="/browse?category=glass" className="hover:text-[#1B3B2B]">Sanitized Glass Jars</Link></li>
                <li><Link to="/browse?category=textile" className="hover:text-[#1B3B2B]">Denim &amp; Tailor Scraps</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1C241E]">Platform</h4>
              <ul className="space-y-2 text-[#5D6E62]">
                <li><Link to="/browse" className="hover:text-[#1B3B2B]">Browse Marketplace</Link></li>
                <li><Link to="/recommendations" className="hover:text-[#1B3B2B]">AI Recommendation Engine</Link></li>
                <li><Link to="/create-listing" className="hover:text-[#1B3B2B]">Post Surplus Material</Link></li>
                <li><Link to="/interests" className="hover:text-[#1B3B2B]">Reuse Proposals</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1C241E]">Academic Docs</h4>
              <ul className="space-y-2 text-[#5D6E62]">
                <li><a href="/#gallery" className="hover:text-[#1B3B2B]">Circular Gallery</a></li>
                <li><Link to="/dashboard" className="hover:text-[#1B3B2B]">User Dashboard</Link></li>
                <li><span className="text-[#76937F]">BCS Capstone Project</span></li>
                <li><span className="text-[#76937F]">Explainable AI Architecture</span></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1C241E]">System Diagnostic</h4>
              <div className="p-3.5 rounded-2xl bg-[#F4EFEA] border border-[#E8E2D6] space-y-1.5 text-[11px] text-[#5D6E62]">
                <div className="flex items-center justify-between">
                  <span>Backend Status:</span>
                  <span className="font-semibold text-[#1B3B2B] capitalize">{connectionStatus}</span>
                </div>
                {latency && (
                  <div className="flex items-center justify-between">
                    <span>DB Latency:</span>
                    <span className="font-semibold text-[#1B3B2B]">{latency} ms</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>ACID Safe:</span>
                  <span className="font-semibold text-[#2D5A3E]">PostgreSQL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Giant Editorial Wordmark from Image 2 */}
          <div className="pt-8 border-t border-[#E8E2D6] text-center select-none">
            <span className="text-5xl sm:text-7xl lg:text-9xl font-serif font-bold tracking-tighter text-[#1C241E]/15 hover:text-[#1C241E]/25 transition-colors">
              ReSource <span className="font-serif italic font-normal">AI</span>
            </span>
            <div className="mt-2 text-xs text-[#76937F] font-medium tracking-widest uppercase">
              Connecting People • Diverting Waste • Empowering Creators
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
