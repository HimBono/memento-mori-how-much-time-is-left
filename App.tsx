import React, { useState, useEffect, useMemo } from 'react';
import { fetchLifeExpectancy } from './services/worldBankService';
import { LifeData, ExpectancyResult } from './types';
import LifeGrid from './components/LifeGrid';
import ProgressCircle from './components/ProgressCircle';
import InsightCard from './components/InsightCard';

const App: React.FC = () => {
  const [formData, setFormData] = useState<LifeData>({ age: 25, country: '', gender: 'male' });
  const [ageInput, setAgeInput] = useState<string>('');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [doomscrollHours, setDoomscrollHours] = useState<string>('');
  const [showDoomscrollInput, setShowDoomscrollInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExpectancyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isAwakeMode, setIsAwakeMode] = useState(false);

  // Generate stable random positions for animated background elements
  const animatedElements = useMemo(() => {
    const dots = Array.from({ length: 30 }).map((_, i) => ({
      id: `dot-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 10
    }));
    
    const sandclocks = Array.from({ length: 8 }).map((_, i) => ({
      id: `sandclock-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 25 + Math.random() * 8
    }));
    
    const clocks = Array.from({ length: 8 }).map((_, i) => ({
      id: `clock-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 28 + Math.random() * 8
    }));
    
    return { dots, sandclocks, clocks };
  }, []); // Empty dependency array - only generate once

  // Comprehensive list of countries
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
    'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
    'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
    'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic',
    'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
    'Czech Republic', 'Denmark', 'Djibouti', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
    'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran',
    'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
    'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Lithuania',
    'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania',
    'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
    'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
    'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama',
    'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
    'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal', 'Serbia', 'Sierra Leone', 'Singapore', 'Slovakia',
    'Slovenia', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan',
    'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand',
    'Togo', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine',
    'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Venezuela',
    'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    if (result) {
      // Initialize with total seconds
      const totalSeconds = result.yearsLeft * 365.242 * 24 * 3600;
      setTimeLeft(totalSeconds);
    }
  }, [result]);

  useEffect(() => {
    if (!result) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

  const formatTime = (totalSeconds: number) => {
    const activeSeconds = isAwakeMode ? totalSeconds * (16 / 24) : totalSeconds;

    const hours = Math.floor(activeSeconds / 3600);
    const minutes = Math.floor((activeSeconds % 3600) / 60);
    const seconds = Math.floor(activeSeconds % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    // Format with thousands separator for hours makes it readable
    return `${hours.toLocaleString()} : ${pad(minutes)} : ${pad(seconds)}`;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`);
          const data = await res.json();
          if (data.countryName) {
            setFormData(prev => ({ ...prev, country: data.countryName }));
            setCountrySearch(data.countryName);
          }
        } catch (e) {
          console.error("Geo lookup failed", e);
        }
      });
    }
  }, []);


  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string for clearing
    if (value === '') {
      setAgeInput('');
      setFormData({ ...formData, age: 0 });
      return;
    }
    // Only allow digits
    if (!/^\d+$/.test(value)) return;
    // Parse and validate
    const numValue = parseInt(value, 10);
    if (numValue >= 1 && numValue <= 120) {
      setAgeInput(value);
      setFormData({ ...formData, age: numValue });
    } else if (numValue > 120) {
      // Cap at 120
      setAgeInput('120');
      setFormData({ ...formData, age: 120 });
    }
  };

  const handleDoomscrollChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string for clearing
    if (value === '') {
      setDoomscrollHours('');
      return;
    }
    // Only allow digits and one decimal point
    if (!/^\d*\.?\d*$/.test(value)) return;
    // Parse and validate (max 24 hours per day)
    const numValue = parseFloat(value);
    if (numValue >= 0 && numValue <= 24) {
      setDoomscrollHours(value);
    } else if (numValue > 24) {
      setDoomscrollHours('24');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    // Validate age
    if (!ageInput || ageInput.trim() === '' || formData.age < 1 || formData.age > 120) {
      setError("Please enter a valid age between 1 and 120.");
      return;
    }
    
    // Validate country - check both formData.country and countrySearch
    const selectedCountry = formData.country.trim();
    const searchCountry = countrySearch.trim();
    if (!selectedCountry || selectedCountry === '' || !searchCountry || searchCountry === '') {
      setError("Every journey needs a starting point. Please select a country from the dropdown.");
      return;
    }
    
    // Validate doomscrolling hours if toggle is enabled
    if (showDoomscrollInput) {
      if (!doomscrollHours || doomscrollHours.trim() === '') {
        setError("Please enter the hours spent doomscrolling per day, or uncheck the option.");
        return;
      }
      const doomscrollValue = parseFloat(doomscrollHours);
      if (isNaN(doomscrollValue) || doomscrollValue < 0 || doomscrollValue > 24) {
        setError("Please enter a valid number between 0 and 24 for doomscrolling hours.");
        return;
      }
    }
    
    setLoading(true);
    try {
      // Always use 'male' as gender
      const data = await fetchLifeExpectancy({ ...formData, gender: 'male' });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "The oracle is silent. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Animated background elements */}
      <div className="animated-background">
        {animatedElements.dots.map((dot) => (
          <div key={dot.id} className="falling-dot" style={{
            left: `${dot.left}%`,
            animationDelay: `${dot.delay}s`,
            animationDuration: `${dot.duration}s`
          }}>•</div>
        ))}
        {animatedElements.sandclocks.map((sandclock) => (
          <div key={sandclock.id} className="falling-icon sandclock" style={{
            left: `${sandclock.left}%`,
            animationDelay: `${sandclock.delay}s`,
            animationDuration: `${sandclock.duration}s`
          }}>
            <img src="/3448485.png" alt="sand clock" />
          </div>
        ))}
        {animatedElements.clocks.map((clock) => (
          <div key={clock.id} className="falling-icon clock" style={{
            left: `${clock.left}%`,
            animationDelay: `${clock.delay}s`,
            animationDuration: `${clock.duration}s`
          }}>
            <img src="/160336.svg" alt="clock" />
          </div>
        ))}
      </div>

      <div className="mystic-container text-center">
        <header style={{ marginBottom: '24px', textAlign: 'center', width: '100%' }}>
          <div className="logo-container">
            <img src="/skull-normal.jpg" alt="Memento Mori Base" className="logo-base" />
            <img src="/skull-hover.jpg" alt="Memento Mori Hover" className="logo-hover" />
          </div>
          <h1 className="gothic-title">Memento mori</h1>
          <p className="gothic-subtitle">Remember death</p>
        </header>

        <main>
          {!result && !loading && (
            <div style={{ marginBottom: '60px' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
                Time is the only <span style={{ fontStyle: 'italic' }}>True Currency</span>.
              </h2>
              <p style={{ maxWidth: '600px', margin: '0 auto', color: '#aaa', lineHeight: '1.6' }}>
                The sands of time wait for no one. Enter your details to visualize your place in the continuum.
              </p>
            </div>
          )}

          <div className="mystic-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

              <div className="retro-group">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label className="stat-label">Age of Soul</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Enter your age"
                      value={ageInput}
                      onChange={handleAgeChange}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                    <label className="stat-label">Birthplace / Current</label>
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCountrySearch(val);
                        setFormData({ ...formData, country: val });
                        setShowCountryDropdown(true);
                      }}
                      onFocus={() => setShowCountryDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
                      placeholder="Search for a country..."
                    />
                    {showCountryDropdown && countrySearch && filteredCountries.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(145deg, #050507, #101018)',
                        border: '1px solid rgba(250, 250, 250, 0.25)',
                        borderRadius: '0px',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        zIndex: 100,
                        marginTop: '6px',
                        boxShadow: '0 18px 32px rgba(0, 0, 0, 0.9)'
                      }}>
                        {filteredCountries.map((country, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setCountrySearch(country);
                              setFormData({ ...formData, country });
                              setShowCountryDropdown(false);
                            }}
                            style={{
                              padding: '10px 16px',
                              cursor: 'pointer',
                              borderBottom: index < filteredCountries.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                              transition: 'background 0.18s ease-out, color 0.18s ease-out',
                              color: '#f5f5f5'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#f5f5f5';
                            }}
                          >
                            {country}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showDoomscrollInput}
                    onChange={(e) => {
                      setShowDoomscrollInput(e.target.checked);
                      if (!e.target.checked) {
                        setDoomscrollHours('');
                      }
                    }}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span className="stat-label" style={{ margin: 0 }}>Calculate doomscrolling impact (optional)</span>
                </label>
                {showDoomscrollInput && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '10px' }}>
                      <img 
                        src="/360_F_950983529_O3WooGHQjM7w3Y3A0kw6a5cGqyaob1Zx.jpg" 
                        alt="Doomscrolling" 
                        style={{
                          maxWidth: '200px',
                          width: '100%',
                          height: 'auto',
                          objectFit: 'contain',
                          opacity: 0.8
                        }}
                      />
                    </div>
                    <label className="stat-label" style={{ marginTop: '10px' }}>Hours Spent Doomscrolling (per day)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g., 2.5"
                      value={doomscrollHours}
                      onChange={handleDoomscrollChange}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '-5px', fontStyle: 'italic' }}>
                      Time spent mindlessly scrolling social media, news feeds, or endless content
                    </p>
                  </>
                )}
              </div>

              <button type="submit" className="mystic-btn" disabled={loading}>
                {loading ? "Gazing into the horizon..." : "Calculate Horizon"}
              </button>

              {error && <p style={{ color: '#ef4444' }}>{error}</p>}
            </form>
          </div>

          {result && (
            <div style={{ marginTop: '60px', opacity: 0, animation: 'fadeIn 1s forwards' }} className="animate-in">
              <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px', alignItems: 'center' }}>
                <ProgressCircle percent={result.percentLived} />
                <div style={{ maxWidth: '400px', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '2rem', marginBottom: '10px' }}>Perspective</h3>
                  <p style={{ lineHeight: '1.6', color: '#ccc' }}>
                    A journey of <b>{result.expectancy.toFixed(2)} years</b>.
                    You have traveled through {Math.floor(result.percentLived)}% of your estimated path.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '40px' }}>
                <InsightCard label="Summers Left" count={result.summersLeft} description="Warm seasons yet to unfold." />
                <InsightCard label="Days Left" count={result.daysLeft} description="Sunrises you may still wake to." />
                <InsightCard label="Weekends Left" count={result.weekendsLeft} description="Shared pauses in the rush." />
              </div>

              <LifeGrid weeksLived={result.weeksLived} totalWeeks={result.totalWeeks} />

              {/* Doomscrolling Impact Section */}
              {doomscrollHours && parseFloat(doomscrollHours) > 0 && result && (
                <div className="mystic-card" style={{ marginTop: '40px' }}>
                  <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>The Cost of Doomscrolling</h3>
                  
                  {(() => {
                    const doomscrollHoursPerDay = parseFloat(doomscrollHours);
                    const awakeHoursPerDay = 16; // Assuming 8 hours sleep
                    const consciousHoursPerDay = Math.max(0, awakeHoursPerDay - doomscrollHoursPerDay);
                    const totalAwakeHoursLeft = result.hoursLeft * (awakeHoursPerDay / 24);
                    const totalDoomscrollHours = (doomscrollHoursPerDay / 24) * result.hoursLeft;
                    const consciousHoursLeft = Math.max(0, totalAwakeHoursLeft - totalDoomscrollHours);

                    // More realistic comparisons - using conservative estimates
                    const booksRead = Math.floor(consciousHoursLeft / 10); // Average 10 hours per book (300-400 pages)
                    const moviesWatched = Math.floor(consciousHoursLeft / 2); // 2 hours per movie
                    const milesWalked = Math.floor(consciousHoursLeft * 2.5); // 2.5 mph average walking pace
                    const skillsMastered = Math.floor(consciousHoursLeft / 500); // ~500 hours for meaningful skill proficiency
                    const novelsWritten = Math.floor(consciousHoursLeft / 1000); // ~1000 hours to write a novel
                    const marathonsRun = Math.floor(consciousHoursLeft / 9); // ~9 hours to walk a marathon at 2.5-3 mph

                    return (
                      <div>
                        <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
                            <strong>Conscious Hours Remaining:</strong> {Math.floor(consciousHoursLeft).toLocaleString()} hours
                          </p>
                          <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '5px' }}>
                            Awake hours: {Math.floor(totalAwakeHoursLeft).toLocaleString()}h
                          </p>
                          <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
                            Lost to doomscrolling: {Math.floor(totalDoomscrollHours).toLocaleString()}h ({Math.floor((totalDoomscrollHours / totalAwakeHoursLeft) * 100)}% of awake time)
                          </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                          {booksRead > 0 && (
                            <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>{booksRead.toLocaleString()}</div>
                              <div style={{ fontSize: '0.85rem', color: '#aaa' }}>Books you could have read</div>
                            </div>
                          )}

                          {moviesWatched > 0 && (
                            <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>{moviesWatched.toLocaleString()}</div>
                              <div style={{ fontSize: '0.85rem', color: '#aaa' }}>Movies you could have watched</div>
                            </div>
                          )}

                          {milesWalked > 0 && (
                            <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>{milesWalked.toLocaleString()}</div>
                              <div style={{ fontSize: '0.85rem', color: '#aaa' }}>Miles you could have walked</div>
                            </div>
                          )}

                          {skillsMastered > 0 && (
                            <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>{skillsMastered}</div>
                              <div style={{ fontSize: '0.85rem', color: '#aaa' }}>Skills you could have mastered</div>
                            </div>
                          )}

                          {novelsWritten > 0 && (
                            <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>{novelsWritten}</div>
                              <div style={{ fontSize: '0.85rem', color: '#aaa' }}>Novels you could have written</div>
                            </div>
                          )}

                          {marathonsRun > 0 && (
                            <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>{marathonsRun.toLocaleString()}</div>
                              <div style={{ fontSize: '0.85rem', color: '#aaa' }}>Marathons you could have run</div>
                            </div>
                          )}
                        </div>

                        <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', textAlign: 'center' }}>
                          <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#ccc', lineHeight: '1.6' }}>
                            "Time spent scrolling is time stolen from yourself. Each hour reclaimed is an hour closer to who you could become."
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Countdown Clock Section */}
              <div style={{ marginTop: '60px', borderTop: '1px dashed #fff', paddingTop: '40px' }}>
                <h3 className="stat-label" style={{ marginBottom: '20px' }}>
                  {isAwakeMode ? "AWAKE TIME REMAINING" : "TOTAL TIME REMAINING"}
                </h3>

                <div style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  marginBottom: '20px'
                }}>
                  {formatTime(timeLeft)}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
                  <button
                    onClick={() => setIsAwakeMode(!isAwakeMode)}
                    className="mystic-btn"
                    style={{ maxWidth: '300px' }}
                  >
                    {isAwakeMode ? "[ SHOW TOTAL TIME ]" : "[ SHOW AWAKE TIME ]"}
                  </button>
                  {isAwakeMode && (
                    <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic', maxWidth: '200px', textAlign: 'left' }}>
                      *Assuming 8 hours of sleep/day
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '40px', fontSize: '0.8rem', color: '#666' }}>
                <p>Data Sources:</p>
                {result.sourceUrls.map((s, i) => (
                  <span key={i} style={{ margin: '0 5px' }}>{s.title.split('|')[0]}</span>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer - at bottom of content */}
      {result && (
        <footer style={{
          width: '100%',
          maxWidth: '960px',
          margin: '40px auto 0',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          boxSizing: 'border-box'
        }}>
        {/* Buy Me a Coffee - Left */}
        <a 
          href="https://buymeacoffee.com/himbono" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            transition: 'transform 0.2s ease-out',
            filter: 'brightness(0.9)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.filter = 'brightness(0.9)';
          }}
        >
          <img 
            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
            alt="Buy Me a Coffee" 
            style={{
              height: '32px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </a>

        {/* Stoic Quote - Middle */}
        <div style={{
          flex: 1,
          textAlign: 'center',
          padding: '0 20px',
          fontStyle: 'italic',
          fontSize: '0.9rem',
          color: 'rgba(255, 255, 255, 0.7)',
          fontFamily: "'Cormorant Garamond', serif",
          lineHeight: '1.3'
        }}>
          "You have power over your mind—not outside events. Realize this, and you will find strength."
        </div>

        {/* Right side - empty for balance */}
        <div style={{ width: '140px' }}></div>
      </footer>
      )}
    </div>
  );
};

export default App;
