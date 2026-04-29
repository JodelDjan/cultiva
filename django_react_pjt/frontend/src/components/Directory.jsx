import { useState, useEffect } from 'react'
import { getResearchers } from '../api'
import ResearcherCard from './ResearcherCard'

export default function Directory() {
  const [researchers, setResearchers] = useState([])

  useEffect(() => {
    getResearchers().then(data => {
      if (Array.isArray(data)) setResearchers(data)
    })
  }, [])

  return (
    
    <div>
      <div className="directory">
      <h2>Researcher Directory</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {researchers.length === 0
          ? <p>No researchers found.</p>
          : researchers.map((researcher, index) => (
              <ResearcherCard key={index} researcher={researcher} />
            ))
        }
        </div>
      </div>
    </div>
  )
}