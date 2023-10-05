import React, { useState } from 'react'; 
import './App.css';

function App() {
  const [area, setArea] = useState('');

  // Handle the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ area } ),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
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
              value={area} // Bind the input value to the 'area' state
              onChange={(e) => {
                setArea(e.target.value)}}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Calculate
          </button>
        </form>
      </div>
    </>
  );
}

export default App;
