"use client";

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [fetchedData, setFetchedData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/submit', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        setFetchedData(result);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Admin Page</h1>
      {fetchedData ? (
        <div>
          <p>사용 시간: {fetchedData.time}</p>
          <p>사유: {fetchedData.reason}</p>
          <p>전화번호: {fetchedData.phone}</p>
          <p>사용 인원: {fetchedData.participants.length}</p>
          {fetchedData.participants.map((participant, index) => (
            <div key={index}>
              <p>이름: {participant.name}</p>
              <p>학번: {participant.id}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
