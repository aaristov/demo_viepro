'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';
import type { NocoDBResponse, Sector, DomainData } from '@/app/types/nocodb';

const colorsList = [
  "#FFB5E8", "#B5EAEA", "#97C1A9", "#FCB5AC", "#BDB2FF", "#FFE5B5",
  "#FFC8A2", "#D4A5A5", "#9EE6CF", "#77DD77", "#B39EB5", "#FFB347"
];

const HealthWheel = () => {
  const router = useRouter();
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<number | null>(null);
  const [expandedCriteria, setExpandedCriteria] = useState<string[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  const fetchNocoDBData = async (): Promise<NocoDBResponse> => {
    try {
      const response = await fetch('/api/nocodb');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data: NocoDBResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const toggleCriteria = (criteria: string) => {
    setExpandedCriteria(prev => 
      prev.includes(criteria) 
        ? prev.filter(c => c !== criteria)
        : [...prev, criteria]
    );
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchNocoDBData();
        
        // Group criteria and origin data by domain
        const domainMap = data.list.reduce<DomainData>((acc, item) => {
          // Create domain map if it doesn't exist
          if (!acc[item.domaines]) {
            acc[item.domaines] = new Map<string, { id: number; origins: Set<string> }>();
          }
          
          const currentDomain = acc[item.domaines];
          if (!currentDomain.has(item.criteres)) {
            currentDomain.set(item.criteres, { id: item.Id, origins: new Set<string>() });
          }
          
          const criteriaData = currentDomain.get(item.criteres);
          if (criteriaData && item.origine_data) {
            criteriaData.origins.add(item.origine_data);
          }
          
          return acc;
        }, {});

        // Convert to final structure
        const newSectors = Object.entries(domainMap).map(([domain, criteriaMap], index) => ({
          text: domain,
          color: colorsList[index % colorsList.length],
          criteria: Array.from(criteriaMap.entries()).map(([criteres, data]) => ({
            criteres,
            id: data.id,
            origine_data: Array.from(data.origins)
          }))
        }));
        
        setSectors(newSectors);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!isDragging && Math.abs(velocity) > 0.1) {
        const deltaTime = timestamp - lastTimestamp;
        setRotation(prev => prev + velocity * deltaTime * 0.1);
        setVelocity(prev => prev * 0.95);
        setLastTimestamp(timestamp);
        animationFrame = requestAnimationFrame(animate);
      }
    };

    if (!isDragging && Math.abs(velocity) > 0.1) {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isDragging, velocity, lastTimestamp]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width;
    const y = e.clientY - rect.top - rect.height / 2;
    setStartAngle(Math.atan2(y, x) - rotation);
    setIsDragging(true);
    setVelocity(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!wheelRef.current) return;
    const touch = e.touches[0];
    const rect = wheelRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left - rect.width;
    const y = touch.clientY - rect.top - rect.height / 2;
    setStartAngle(Math.atan2(y, x) - rotation);
    setIsDragging(true);
    setVelocity(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !wheelRef.current) return;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x);
    const newRotation = angle - startAngle;
    
    setVelocity((newRotation - rotation) / 16);
    setRotation(newRotation);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !wheelRef.current) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = wheelRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left - rect.width;
    const y = touch.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x);
    const newRotation = angle - startAngle;
    
    setVelocity((newRotation - rotation) / 16);
    setRotation(newRotation);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastTimestamp(performance.now());
  };

  const handleSectorClick = (index: number) => {
    if (!isDragging) {
      if (selectedSector !== index) {
        setExpandedCriteria([]); // Reset expanded state when switching sectors
      }
      setSelectedSector(selectedSector === index ? null : index);
      
      // Store the selected domain and its criteria in localStorage
      const selectedSectorData = sectors[index];
      localStorage.setItem('selectedDomain', selectedSectorData.text);
      localStorage.setItem('selectedCriteria', JSON.stringify(selectedSectorData.criteria));
      
      // Redirect to questionnaire chat after a short delay with the domain parameter
      setTimeout(() => {
        router.push(`/questionnaire?domain=${encodeURIComponent(selectedSectorData.text)}`);
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading domains...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-blue-50 overflow-hidden">
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <Heart className="text-pink-500" />
        <span className="text-xl font-bold text-gray-700">Domain Survey</span>
      </div>
      
      <div 
        ref={wheelRef}
        className="absolute left-0 top-1/2 -translate-y-1/2 touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <svg width="800" height="800" viewBox="0 0 800 800">
          <g transform={`translate(400, 400) rotate(${rotation * 180 / Math.PI})`}>
            {sectors.map((sector, index) => {
              const angle = (2 * Math.PI * index) / sectors.length;
              const nextAngle = (2 * Math.PI * (index + 1)) / sectors.length;
              const midAngle = (angle + nextAngle) / 2;
              
              const startX = Math.cos(angle) * 300;
              const startY = Math.sin(angle) * 300;
              const endX = Math.cos(nextAngle) * 300;
              const endY = Math.sin(nextAngle) * 300;
              
              return (
                <g key={index} onClick={() => handleSectorClick(index)} style={{ cursor: 'pointer' }}>
                  <path
                    d={`M 0 0 L ${startX} ${startY} A 300 300 0 0 1 ${endX} ${endY} Z`}
                    fill={sector.color}
                    className="transition-opacity duration-200 hover:opacity-90"
                  />
                  <text
                    x={Math.cos(midAngle) * 200}
                    y={Math.sin(midAngle) * 200}
                    textAnchor="middle"
                    transform={`rotate(${90 + midAngle * 180 / Math.PI} ${Math.cos(midAngle) * 200} ${Math.sin(midAngle) * 200})`}
                    className="text-gray-700 text-lg font-medium"
                    style={{ userSelect: 'none' }}
                  >
                    {sector.text}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-gray-600">
        Click on a sector to start the survey!
      </div>
    </div>
  );
};

export default HealthWheel;