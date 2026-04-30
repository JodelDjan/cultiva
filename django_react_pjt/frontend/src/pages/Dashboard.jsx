import { useState, useEffect } from 'react'
import { getDashboard } from '../api'
import { useNavigate } from 'react-router-dom'
import CreatePost from '../components/CreatePost'
import Sidebar from '../components/Sidebar'

export default function Dashboard() {
  const [posts, setPosts]               = useState([])
  const [error, setError]               = useState('')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const navigate                        = useNavigate()

  useEffect(() => {
    const role = localStorage.getItem('role')
    if (role !== 'researcher') {
      navigate('/')
      return
    }
    getDashboard().then(data => {
      if (Array.isArray(data)) setPosts(data)
    })
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar setPosts={() => {}} />

      <div style={{ marginLeft: '72px', flex: 1, padding: '2rem' }}>

        {/* Header with send post button */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            onClick={() => setShowCreatePost(true)}
            style={{
              backgroundColor: '#2563eb',
              color:           'white',
              border:          'none',
              padding:         '0.5rem 1.2rem',
              borderRadius:    '8px',
              cursor:          'pointer',
              fontSize:        '0.9rem',
              display:         'flex',
              alignItems:      'center',
              gap:             '0.5rem',
            }}
          >
            <i className="bi bi-send"></i> Send Post
          </button>
        </div>

        <h1 style={{ marginBottom: '1.5rem' }}>Applicants Dashboard</h1>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {posts.length === 0 ? (
          <p>You have no posts yet.</p>
        ) : (
          posts.map(post => (
            <div key={post.post_id} style={{
              border:        '1px solid #e5e7eb',
              borderRadius:  '8px',
              padding:       '1rem',
              marginBottom:  '1rem'
            }}>
              <h2>{post.title}</h2>
              <p>{post.application_count} application{post.application_count !== 1 ? 's' : ''} received</p>

              {post.applicants.length === 0 ? (
                <p style={{ color: '#6b7280' }}>No applicants yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>First Name</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Last Name</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {post.applicants.map((applicant, index) => (
                      <tr key={index}>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{applicant.first_name}</td>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{applicant.last_name}</td>
                        <td style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>{applicant.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))
        )}

        {/* CreatePost modal with notify flag */}
        {showCreatePost && (
          <CreatePost
            setPosts={() => {}}
            onClose={() => setShowCreatePost(false)}
            notify={true}
          />
        )}
      </div>
    </div>
  )
}