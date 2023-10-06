import React, { useState } from 'react';
import './App.css';

function App() {
  const [area, setArea] = useState('');
  const [ans, setAns] = useState({});

  // Handle the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ area }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setAns(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <>
      <div className="container my-3">
        <h2>Area</h2>
        <form className="my-3" id="areaForm" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Area
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="area"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
              }}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Calculate
          </button>
          {ans.landarea !== undefined && (
            <div
              style={{
                border: '1px solid #ccc',
                borderRadius: '5px',
                padding: '10px',
                margin: '10px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <p>
                Total land area of {area}:{' '}
                <span style={{ fontWeight: 'bold' }}>{ans.landarea}</span> (in hect)
              </p>
            </div>
          )}
          {ans.floodAreaHa !== undefined && (
            <div
              style={{
                border: '1px solid #ccc',
                borderRadius: '5px',
                padding: '10px',
                margin: '10px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <p>
                Flooded area of {area}: <span style={{ fontWeight: 'bold' }}>{ans.floodAreaHa}</span> (in hect)
              </p>
            </div>
          )}
          {ans.floodAreaHa !== undefined && ans.landarea !== undefined && (
            <div
              style={{
                border: '1px solid #ccc',
                borderRadius: '5px',
                padding: '10px',
                margin: '10px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <p>
                Percentage of area flooded:{' '}
                <span style={{ fontWeight: 'bold' }}>
                  {(ans.floodAreaHa / ans.landarea) * 100}%
                </span>
              </p>
            </div>
          )}
        </form>
      </div>
    </>
  );
}

export default App;
