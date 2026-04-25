import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, searchPosts, getPosts } from '../api'

const TAG_OPTIONS = [
  'Health and Fitness', 'Mental Health', 'Medicine', 'Law',
  'Technology', 'Public Health', 'Nutrition', 'Molecular Biology',
  'Pharmacology', 'Biomedical Science', 'Microbiology',
  'Anatomy and Physiology', 'Immunology', 'Environmental Science',
  'Business', 'Software Development',
]

export default function Navbar({ setPosts }) {
  const navigate                        = useNavigate()
  const role                            = localStorage.getItem('role')
  const [unreadCount, setUnreadCount]   = useState(0)
  const [query, setQuery]               = useState('')
  const [showFilter, setShowFilter]     = useState(false)
  const [selectedTag, setSelectedTag]   = useState('')

  useEffect(() => {
    if (role === 'general_user') {
      getNotifications().then(data => {
        if (Array.isArray(data)) {
          setUnreadCount(data.filter(n => !n.is_read).length)
        }
      })
    }
  }, [])

  const handleSearch = () => {
    if (query.trim()) {
      searchPosts(query).then(data => setPosts(data))
    } else {
      getPosts().then(data => {
        if (Array.isArray(data)) setPosts(data)
      })
    }
  }

  const handleTagFilter = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag('')
      setShowFilter(false)
      getPosts().then(data => {
        if (Array.isArray(data)) setPosts(data)
      })
    } else {
      setSelectedTag(tag)
      setShowFilter(false)
      getPosts(tag).then(data => {
        if (Array.isArray(data)) setPosts(data)
      })
    }
  }

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>

      {/* Search bar with filter icon */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyUp={handleSearch}
          style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}
        />

        <button
          onClick={() => setShowFilter(prev => !prev)}
          style={{
            background:   selectedTag ? '#2563eb' : '#f3f4f6',
            color:        selectedTag ? 'white' : 'black',
            border:       'none',
            borderRadius: '6px',
            padding:      '0.4rem 0.6rem',
            cursor:       'pointer',
            fontSize:     '1rem',
          }}
          title="Filter by tag"
        >
          ⚙
        </button>

        {showFilter && (
          <div style={{
            position:        'absolute',
            top:             '2.5rem',
            left:            0,
            backgroundColor: 'white',
            border:          '1px solid #e5e7eb',
            borderRadius:    '8px',
            padding:         '0.5rem',
            zIndex:          1000,
            width:           '220px',
            boxShadow:       '0 4px 12px rgba(0,0,0,0.1)',
            maxHeight:       '300px',
            overflowY:       'auto',
          }}>
            {TAG_OPTIONS.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagFilter(tag)}
                style={{
                  display:         'block',
                  width:           '100%',
                  textAlign:       'left',
                  padding:         '0.4rem 0.6rem',
                  border:          'none',
                  backgroundColor: selectedTag === tag ? '#eff6ff' : 'transparent',
                  cursor:          'pointer',
                  borderRadius:    '4px',
                  color:           selectedTag === tag ? '#2563eb' : 'black',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {role === 'researcher' && (
        <span onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          Dashboard
        </span>
      )}

      {role === 'general_user' && (
        <>
          <span onClick={() => navigate('/applications')} style={{ cursor: 'pointer' }}>
            My Applications
          </span>
          <span onClick={() => navigate('/bookmarks')} style={{ cursor: 'pointer' }}>
            Bookmarks
          </span>
          <span
            onClick={() => navigate('/notifications')}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            Notifications
            {unreadCount > 0 && (
              <span style={{
                backgroundColor: '#dc2626',
                color:           'white',
                borderRadius:    '999px',
                fontSize:        '0.7rem',
                padding:         '0.1rem 0.4rem',
                marginLeft:      '0.3rem',
              }}>
                {unreadCount}
              </span>
            )}
          </span>
        </>
      )}

      <span onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
        Profile
      </span>
    </nav>
  )
}