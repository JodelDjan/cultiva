import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, searchPosts, getPosts } from '../api'
import { useEffect } from 'react'
import CreatePost from './CreatePost'
import {createPortal} from 'react-dom'

const TAG_OPTIONS = [
  'Health and Fitness', 'Mental Health', 'Medicine', 'Law',
  'Technology', 'Public Health', 'Nutrition', 'Molecular Biology',
  'Pharmacology', 'Biomedical Science', 'Microbiology',
  'Anatomy and Physiology', 'Immunology', 'Environmental Science',
  'Business', 'Software Development',
]

export default function Sidebar({ setPosts, activeTab, setActiveTab }) {
  const navigate                      = useNavigate()
  const role                          = localStorage.getItem('role')
  const [unreadCount, setUnreadCount] = useState(0)
  const [query, setQuery]             = useState('')
  const [hoveredItem, setHoveredItem] = useState(null)
  const [showCreatePost, setShowCreatePost] = useState(false)

  useEffect(() => {
    if (role === 'general_user' || role == 'researcher') {
      getNotifications().then(data => {
        if (Array.isArray(data)) {
          setUnreadCount(data.filter(n => !n.is_read).length)
        }
      })
    }
  }, [])


  const navItems = [
    ...(role === 'researcher' ? [
      { id: 'dashboard', icon: 'bi-grid', label: 'Dashboard', action: () => navigate('/dashboard') },
      { id: 'notifications', icon: 'bi-bell',       label: 'Notifications', action: () => navigate('/notifications'), badge: unreadCount },
    ] : []),
    ...(role === 'general_user' ? [
      { id: 'applications', icon: 'bi-file-earmark-text' , label: 'My Applications', action: () => navigate('/applications') },
      { id: 'bookmarks',    icon: 'bi-bookmark',          label: 'Bookmarks',        action: () => navigate('/bookmarks') },
      { id: 'notifications', icon: 'bi-bell',             label: 'Notifications',    action: () => navigate('/notifications'), badge: unreadCount },
    ] : []),
    { id: 'profile', icon: 'bi-person-circle', label: 'Profile', action: () => navigate('/profile') },
  ]

  return (
    <div style={{
      width:           '72px',
      minHeight:       '100vh',
      backgroundColor: '#02968A',
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      paddingTop:      '1.5rem',
      paddingBottom:   '1.5rem',
      gap:             '0.5rem',
      position:        'fixed',
      left:            0,
      top:             0,
      zIndex:          100,
    }}>

      {/* Logo / Home */}
      <div
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        <i className="bi bi-house-door-fill" style={{ fontSize: '1.8rem', color: '#96DDA5' }}></i>
      </div>

      
      {/* Nav items with hover tooltip */}
      {navItems.map(item => (
        <div
          key={item.id}
          style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            onClick={item.action}
            style={{
              background:   'none',
              border:       'none',
              cursor:       'pointer',
              padding:      '0.6rem',
              borderRadius: '8px',
              color:        '#374151',
              fontSize:     '1.3rem',
              position:     'relative',
              backgroundColor: hoveredItem === item.id ? '#f3f4f6' : 'transparent',
              transition:   'background-color 0.15s',
            }}
          >
            <i className={`bi ${item.icon}`}></i>
            {item.badge > 0 && (
              <span style={{
                position:        'absolute',
                top:             '4px',
                right:           '4px',
                backgroundColor: '#dc2626',
                color:           'white',
                borderRadius:    '999px',
                fontSize:        '0.6rem',
                padding:         '0.1rem 0.3rem',
                lineHeight:      1,
              }}>
                {item.badge}
              </span>
            )}
          </button>

          {/* Hover label */}
          {hoveredItem === item.id && (
            <div style={{
              position:        'absolute',
              left:            '56px',
              top:             '50%',
              transform:       'translateY(-50%)',
              backgroundColor: '#1f2937',
              color:           'white',
              padding:         '0.3rem 0.7rem',
              borderRadius:    '6px',
              fontSize:        '0.8rem',
              whiteSpace:      'nowrap',
              zIndex:          200,
              pointerEvents:   'none',
            }}>
              {item.label}
            </div>
          )}
        </div>
      ))}

      {/* Create post button for researchers */}
      {role === 'researcher' && (
        <div
          style={{ position: 'relative', width: '100%',
          display: 'flex', justifyContent: 'center', marginTop: 'auto' }}
          onMouseEnter={() => setHoveredItem('create')}
          onMouseLeave={() => setHoveredItem(null)}
        >
        <button
        onClick={() => setShowCreatePost(true)}
        style={{
            backgroundColor: '#96DDA5',
            color:           'black',
            border:          'none',
            borderRadius:    '50%',
            width:           '30px',
            height:          '40px',
            fontSize:        '1rem',
            cursor:          'pointer',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            outline:         'none',
            boxShadow:       'none',
        }}
        >
            <i className="bi-plus-lg"></i>
          </button>

          {hoveredItem === 'create' && (
            <div style={{
              position:        'absolute',
              left:            '56px',
              top:             '50%',
              transform:       'translateY(-50%)',
              backgroundColor: '#1f2937',
              color:           'white',
              padding:         '0.3rem 0.7rem',
              borderRadius:    '6px',
              fontSize:        '0.8rem',
              whiteSpace:      'nowrap',
              zIndex:          200,
              pointerEvents:   'none',
            }}>
              New Post
            </div>
          )}
        </div>
      )}

        {/* CreatePost modal */}
      {showCreatePost && createPortal (
        <CreatePost
          setPosts={setPosts}
          onClose={() => setShowCreatePost(false)}
        />,
        document.body
      )}
    </div>
  )
}