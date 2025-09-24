import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = ({ data }) => {
  const chartContainer = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // ✅ Guard against null data or empty datasets
    if (!data || !data.datasets || data.datasets.length === 0) return;

    // ✅ Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // ✅ Create new chart if canvas is ready
    if (chartContainer.current) {
      chartInstance.current = new Chart(chartContainer.current, {
        type: 'line',
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
        }
      });
    }

    // ✅ Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div style={{ position: 'relative', height: '300px' }}>
      <canvas ref={chartContainer} />
    </div>
  );
};

export default ChartComponent;