'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heart } from 'lucide-react';
import type { NocoDBResponse, CriteriaItem } from '@/app/types/nocodb';

interface Sector {
  text: string;
  color: string;
}

const HealthWheel = () => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Color palette for the sectors
  const colors = [
    "#FFB5E8", "#B5EAEA", "#97C1A9", "#FCB5AC", "#BDB2FF", "#FFE5B5",
    "#FFC8A2", "#D4A5A5", "#9EE6CF", "#77DD77", "#B39EB5", "#FFB347"
  ];
  
  const fetchNocoDBData = async (): Promise<NocoDBResponse> => {
    try {
      const response = await fetch('/api/nocodb');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data: NocoDBResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchNocoDBData();
        // Extract unique domains from the data
        const uniqueDomains = [...new Set(data.list.map(item => item.domaines))];
        
        // Create sectors with colors
        const newSectors = uniqueDomains.map((domain, index) => ({
          text: domain,
          color: colors[index % colors.length]
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
        setVelocity(prev => prev * 0.95); // Apply friction
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
                <g key={index}>
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
        Drag the wheel to explore domains!
      </div>
    </div>
  );
};

export default HealthWheel;