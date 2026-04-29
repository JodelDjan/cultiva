import { useState, useEffect } from 'react'
import { getProfile, getPosts } from '../api'
import PostCard from '../components/PostCard'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [posts, setPosts]     = useState([])
  const navigate              = useNavigate()

  useEffect(() => {
    getProfile().then(data => setProfile(data))
    getPosts().then(data => {
      if (Array.isArray(data)) setPosts(data)
    })
  }, [])

  if (!profile) return <p>Loading...</p>

  return (
     <div className="auth-page">
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem' }}>

      {/* Shared header */}
      <div>
        <h1>{profile.first_name} {profile.last_name}</h1>
        <button onClick={() => navigate('/profile/edit')}>Edit Profile</button>
      </div>

      {/* Researcher profile */}
      {profile.role === 'researcher' && (
        <>
          <div>
            <h3>Bio</h3>
            <p>{profile.bio || 'No bio yet.'}</p>
          </div>

          <div>
            <h3>Research Area</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {profile.tags && profile.tags.map(tag => (
                <span key={tag} style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '999px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontSize: '0.8rem'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3>Posts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {posts
                .filter(post => post.author_name === `${profile.first_name} ${profile.last_name}`)
                .map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              }
            </div>
          </div>
        </>
      )}

      {/* General user profile */}
      {profile.role === 'general_user' && (
        <>
          <div>
            <h3>Interests</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {profile.tags && profile.tags.map(tag => (
                <span key={tag} style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '999px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  fontSize: '0.8rem'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  )
}