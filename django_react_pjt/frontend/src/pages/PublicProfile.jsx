import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicProfile } from '../api'

export default function PublicProfile() {
  const { userId }        = useParams()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getPublicProfile(userId).then(data => setProfile(data))
  }, [userId])

  if (!profile) return <p>Loading...</p>

  return (
    <div className="auth-page">
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>
      <h1>{profile.first_name} {profile.last_name}</h1>

      <div style={{ marginTop: '1rem' }}>
        <h3>Bio</h3>
        <p>{profile.bio || 'No bio yet.'}</p>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h3>Research Area</h3>
        <p>{profile.research_area || 'Not specified.'}</p>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h3>Tags</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {profile.tags && profile.tags.map(tag => (
            <span key={tag} style={{
              padding:         '0.3rem 0.6rem',
              borderRadius:    '999px',
              backgroundColor: '#96DDA5',
              color:           'white',
              fontSize:        '0.8rem'
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h3>Posts</h3>
        {profile.posts && profile.posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {profile.posts && profile.posts.map(post => (
              <div key={post.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
                <h2>{post.title}</h2>
                <p>{post.body}</p>
                <p>Start Date: {post.start_date}</p>
                <p>Tags: {post.tags && post.tags.join(', ')}</p>
                <p>Max Participants: {post.max_participants}</p>
                <p>State: {post.state}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
  )
}