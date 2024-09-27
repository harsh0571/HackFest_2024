import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  if (!analytics) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="analytics">
      <h2>Analytics</h2>
      <p>Total Bookings: {analytics.total_bookings}</p>
      <p>Total Revenue: ${analytics.total_revenue}</p>
      {analytics.popular_date && (
        <p>Most Popular Date: {new Date(analytics.popular_date.date).toLocaleDateString()} (Bookings: {analytics.popular_date.count})</p>
      )}
    </div>
  );
};

export default Analytics;