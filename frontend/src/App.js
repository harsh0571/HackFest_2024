import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Analytics from './Analytics';
import './App.css';

function App() {
  const [dates, setDates] = useState([]);
  const [prices, setPrices] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [tickets, setTickets] = useState({ adult: 0, child: 0, senior: 0 });
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    fetchDates();
    fetchPrices();
    fetchShows();
  }, []);

  const fetchDates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dates');
      setDates(response.data);
    } catch (error) {
      console.error('Error fetching dates:', error);
    }
  };

  const fetchPrices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/prices');
      setPrices(response.data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const fetchShows = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/shows');
      setShows(response.data);
    } catch (error) {
      console.error('Error fetching shows:', error);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTicketChange = (type, value) => {
    setTickets({ ...tickets, [type]: parseInt(value) });
  };

  const handleShowChange = (e) => {
    setSelectedShow(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/book', {
        date: selectedDate,
        tickets,
        show: selectedShow,
      });
      if (response.data.error) {
        setError(response.data.error);
        setBooking(null);
      } else {
        setBooking(response.data);
        setError('');
        setPaymentStatus('pending');
      }
    } catch (error) {
      setError('An error occurred while processing your booking.');
      setBooking(null);
    }
  };

  const handlePayment = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/payment/process', {
        payment_id: booking.payment_id
      });
      if (response.data.status === 'success') {
        setPaymentStatus('completed');
        alert('Payment successful!');
      } else {
        setPaymentStatus('failed');
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setPaymentStatus('failed');
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="App">
      <h1>Museum Ticket Booking</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Select Date:</label>
          <select value={selectedDate} onChange={handleDateChange}>
            <option value="">Select a date</option>
            {dates.map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        {Object.entries(prices).map(([type, price]) => (
          <div key={type}>
            <label>{type.charAt(0).toUpperCase() + type.slice(1)} (${price}):</label>
            <input
              type="number"
              min="0"
              value={tickets[type]}
              onChange={(e) => handleTicketChange(type, e.target.value)}
            />
          </div>
        ))}
        <div>
          <label>Select Show (Optional):</label>
          <select value={selectedShow} onChange={handleShowChange}>
            <option value="">No show</option>
            {shows.map((show) => (
              <option key={show.id} value={show.id}>
                {show.name} - ${show.price}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Book Tickets</button>
      </form>
      {error && <p className="error">{error}</p>}
      {booking && (
        <div className="booking-summary">
          <h2>Booking Summary</h2>
          <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
          {Object.entries(booking.tickets).map(([type, amount]) => (
            <p key={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)} tickets: {amount}
            </p>
          ))}
          <p>Total Cost: ${booking.total_cost}</p>
          {paymentStatus === 'pending' && (
            <button onClick={handlePayment}>Pay Now</button>
          )}
          {paymentStatus === 'completed' && (
            <p className="success">Payment completed successfully!</p>
          )}
          {paymentStatus === 'failed' && (
            <p className="error">Payment failed. Please try again.</p>
          )}
        </div>
      )}
      <button onClick={() => setShowAnalytics(!showAnalytics)}>
        {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
      </button>
      {showAnalytics && <Analytics />}
    </div>
  );
}

export default App;