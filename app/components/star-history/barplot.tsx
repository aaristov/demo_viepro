'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HistoryEntry {
  criteriaId: string;
  criteria: string;
  date: string;
  rating: number;
}

interface DomainHistoryData {
  entries: HistoryEntry[];
  criteriaMap: {
    [criteriaId: string]: string;
  };
}

interface StarHistoryBarplotProps {
  domain: string;
  isVisible: boolean;
  className?: string;
}

const generateColors = (count: number) => {
  const baseColors = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
    'rgba(83, 102, 255, 0.8)',
    'rgba(40, 159, 64, 0.8)',
    'rgba(210, 105, 30, 0.8)',
  ];

  const borderColors = baseColors.map(color => color.replace('0.8', '1'));
  
  return {
    backgroundColor: Array(count).fill(0).map((_, i) => baseColors[i % baseColors.length]),
    borderColor: Array(count).fill(0).map((_, i) => borderColors[i % borderColors.length]),
  };
};

// Function to truncate long criteria names for better display in the legend
const truncateCriteriaName = (name: string, maxLength: number = 25) => {
  if (!name) return 'Unknown';
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

const StarHistoryBarplot: React.FC<StarHistoryBarplotProps> = ({ domain, isVisible, className }) => {
  const [historyData, setHistoryData] = useState<DomainHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible || !domain) return;

    const fetchHistoryData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/star-history?domain=${encodeURIComponent(domain)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch star history data');
        }
        
        const data = await response.json();
        const domainData = data[domain];
        
        if (!domainData) {
          setHistoryData(null);
          setError('No history data found for this domain');
        } else {
          setHistoryData(domainData);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching star history:', error);
        setError('Failed to load history data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryData();
  }, [domain, isVisible]);

  if (!isVisible) return null;
  if (isLoading) return <div className={`${className} p-4 text-center bg-white rounded-lg shadow-lg`}>Loading history data...</div>;
  if (error || !historyData) {
    return (
      <div className={`${className} p-4 text-center bg-white rounded-lg shadow-lg`}>
        <p>{error || 'No rating history available for this domain yet'}</p>
      </div>
    );
  }

  // Process data for the chart
  const processChartData = () => {
    // Sort entries by date
    const sortedEntries = [...historyData.entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group by date and then by criteria
    const groupedData: Record<string, Record<string, number>> = {};
    const criteriaSet = new Set<string>();

    sortedEntries.forEach(entry => {
      if (!groupedData[entry.date]) {
        groupedData[entry.date] = {};
      }
      
      // Only use the criteriaId if it's a valid string
      const criteriaKey = entry.criteriaId || `unknown-${Math.random().toString(36).substr(2, 9)}`;
      groupedData[entry.date][criteriaKey] = entry.rating;
      criteriaSet.add(criteriaKey);
    });

    // Prepare the labels (dates)
    const labels = Object.keys(groupedData).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    // Convert dates to more readable format
    const formattedLabels = labels.map(date => {
      const d = new Date(date);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    });

    // Create datasets for each criteria
    const criteriaIds = Array.from(criteriaSet);
    const { backgroundColor, borderColor } = generateColors(criteriaIds.length);

    const datasets = criteriaIds.map((criteriaId, index) => {
      const data = labels.map(date => groupedData[date][criteriaId] || 0);
      
      // Get the proper criteria name
      const criteriaName = historyData.criteriaMap[criteriaId] || criteriaId;
      
      return {
        label: truncateCriteriaName(criteriaName),
        data,
        backgroundColor: backgroundColor[index],
        borderColor: borderColor[index],
        borderWidth: 1,
      };
    });

    return {
      labels: formattedLabels,
      datasets,
    };
  };

  const chartData = processChartData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        stacked: true,
        min: 0,
        max: 5,
        title: {
          display: true,
          text: 'Star Rating'
        },
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: function(tooltipItems: any) {
            const date = tooltipItems[0].label;
            return `Date: ${date}`;
          },
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} ${value === 1 ? 'star' : 'stars'}`;
          }
        }
      },
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: `Rating History for ${domain}`,
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
    },
  };

  return (
    <div className={`${className} p-4 bg-white rounded-lg shadow-lg`}>
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default StarHistoryBarplot;