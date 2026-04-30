import { useState, useEffect } from 'react'
import { getProfile, getPosts } from '../api'
import { useNavigate } from 'react-router-dom'
import PostCard from '../components/PostCard'
import SideBar from '../components/SideBar'

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

  const myPosts = posts.filter(
    post => post.author_name === `${profile.first_name} ${profile.last_name}`
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <SideBar setPosts={setPosts} />

      <div style={{ marginLeft: '72px', flex: 1, minWidth: 0 }}>

        {/* Profile header section */}
        <div style={{
          backgroundColor: '#FFFF67',
          padding:         '2rem',
          color:           'black',
        }}>
          {/* Name row with edit button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '600' }}>
              {profile.first_name} {profile.last_name}
            </h1>
            <button
              onClick={() => navigate('/profile/edit')}
              style={{
                backgroundColor: 'white',
                color:           '#02968A',
                border:          'none',
                padding:         '0.4rem 1rem',
                borderRadius:    '6px',
                cursor:          'pointer',
                fontWeight:      '500',
                fontSize:        '0.85rem',
              }}
            >
              Edit Profile
            </button>
          </div>

          {/* Researcher specific header info */}
          {profile.role === 'researcher' && (
            <>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.95rem', opacity: 0.85 }}>
                {profile.research_area || 'No research area set.'}
              </p>
              <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {profile.bio || 'No bio yet.'}
              </p>
            </>
          )}

          {/* General user specific header info */}
          {profile.role === 'general_user' && (
            <>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.95rem', opacity: 0.85 }}>
                {profile.age_range || 'No age range set.'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                {profile.tags && profile.tags.map(tag => (
                  <span key={tag} style={{
                    padding:         '0.2rem 0.6rem',
                    borderRadius:    '999px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    fontSize:        '0.8rem',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Posts section */}
        {profile.role === 'researcher' && (
          <div style={{ padding: '1rem' }}>
            <h2 style={{ marginBottom: '1rem', fontWeight: '400', color: 'white' }}>Posts</h2>
            {myPosts.length === 0 ? (
              <p>No posts yet.</p>
            ) : (
              myPosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  setPosts={setPosts}
                  getPosts={getPosts}
                />
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}