import { useState, useEffect } from 'react'
import { applyToPost, editPost, closePost,  bookmarkPost, removeBookmark, getApplications, getBookmarks, deletePost} from '../api'
import EditPost from './EditPost'
import { createPortal } from 'react-dom'


//Tag Options
const TAG_OPTIONS =[
  'Health and Fitness',
  'Mental Health',
  'Medicine',
  'Law',
  'Technology',
  'Public Health',
  'Nutrition',
  'Molecular Biology',
  'Pharmacology',
  'Biomedical Science',
  'Microbiology',
  'Anatomy and Physiology',
  'Immunology',
  'Environmental Science',
  'Business',
  'Software Development',
]

export default function PostCard({ post, setPosts, getPosts, initialBookmarked = false, onUnbookmark}) {
  const role            = localStorage.getItem('role')
  const token           = localStorage.getItem('token')
  const isAuthenticated = !!token
  const firstName = localStorage.getItem('first_name')
  const lastName  = localStorage.getItem('last_name')
  const fullName  = `${firstName} ${lastName}`
  const isOwnPost = post.author_name === fullName
  const [applied, setApplied]   = useState(false)
  const [error, setError]       = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    title:            post.title,
    body:             post.body,
    tags:             post.tags || [],
    max_participants: post.max_participants,
    start_date:       post.start_date,
    research_link:    post.research_link || '',
  })

  const [showPreApply, setShowPreApply] = useState(false)
  const [preApplyForm, setPreApplyForm] = useState({
  has_read_post:      false,
  meets_requirements: false,
  has_consented:      false,
  })
  const [preApplyError, setPreApplyError] = useState('')

  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  console.log(post.image)

useEffect(() => {
  const role = localStorage.getItem('role')
  if (role === 'general_user') {
    Promise.all([getApplications(), getBookmarks()]).then(([applications, bookmarks]) => {
      if (Array.isArray(applications)) {
        const hasApplied = applications.some(app => app.post_id === post.id)
        setApplied(hasApplied)
      }
      if (Array.isArray(bookmarks)) {
        const hasBookmarked = bookmarks.some(b => b.post_id === post.id)
        setBookmarked(hasBookmarked)
      }
    })
  }
}, [post.id])

async function handleDelete() {
  try {
    await deletePost(post.id)
    if (getPosts) {
      getPosts().then(data => {
        if (Array.isArray(data)) setPosts(data)
      })
    }
  } catch (err) {
    setError('Failed to delete post.')
  }
}

function handlePreApplyChange(e) {
  setPreApplyForm({ ...preApplyForm, [e.target.name]: e.target.checked })
  if (preApplyError) setPreApplyError('')
}

async function handleFinalApply() {
  if (!preApplyForm.has_read_post)
    return setPreApplyError('Please confirm you have read the post.')
  if (!preApplyForm.meets_requirements)
    return setPreApplyError('Please confirm you meet the requirements.')
  if (!preApplyForm.has_consented)
    return setPreApplyError('Please confirm you consent to participate.')

  try {
    await applyToPost(post.id)
    setApplied(true)
    setShowPreApply(false)
    if (getPosts) {
      getPosts().then(data => {
        if (Array.isArray(data)) setPosts(data)
      })
    }
    window.open(post.research_link, '_blank')
  } catch (err) {
    setPreApplyError('Failed to submit application.')
  }
}

  const handleApply = async (postId) => {
    const response = await applyToPost(postId)
    if (response.error) {
      setError(response.error)
    } else {
      setApplied(true)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function toggleTag(tag) {
    setForm(prev => {
      const selected = prev.tags.includes(tag)
      return {
        ...prev,
        tags: selected ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
      }
    })
  }

  async function handleEdit() {
    if (!form.title.trim()) return setError('Title is required.')
    if (!form.body.trim())  return setError('Body is required.')
    if (form.tags.length === 0) return setError('Please select at least one tag.')

    try {
      await editPost(post.id, form)
      getPosts().then(data => {
        if (Array.isArray(data)) setPosts(data)
      })
      setIsEditing(false)
      setError(null)
    } catch (err) {
      setError('Failed to update post.')
    }
  }

async function handleBookmark() {
  try {
    if (bookmarked) {
      await removeBookmark(post.id)
      setBookmarked(false)
      if (onUnbookmark) onUnbookmark(post.id)
    } else {
      await bookmarkPost(post.id)
      setBookmarked(true)
    }
  } catch (err) {
    setError('Failed to update bookmark.')
  }
}

  async function handleClose() {
    try {
      await closePost(post.id)
      getPosts().then(data => {
        if (Array.isArray(data)) setPosts(data)
      })
    } catch (err) {
      setError('Failed to close post.')
    }
  }

 return (
  <div style={{
    backgroundColor: '#fffF67',
    borderRadius:    '12px',
    
    padding:         '1.25rem',
    marginBottom:    '1rem',
    fontFamily:      'Inter, sans-serif',
  }}>

    {/* Closed badge */}
    {post.state === 'closed' && (
      <span style={{
        backgroundColor: '#fee2e2',
        color:           '#dc2626',
        padding:         '0.2rem 0.6rem',
        borderRadius:    '999px',
        fontSize:        '0.75rem',
        marginBottom:    '0.75rem',
        display:         'inline-block'
      }}>
        Closed
      </span>
    )}

    {/* Post display */}
    <div>
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{
          width:           '44px',
          height:          '44px',
          borderRadius:    '50%',
          backgroundColor: '#2563eb',
          color:           'white',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          fontWeight:      '600',
          fontSize:        '1rem',
          marginRight:     '0.75rem',
          flexShrink:      0,
        }}>
          {post.author_name ? post.author_name.charAt(0).toUpperCase() : '?'}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: '600', fontSize: '0.95rem', color: '#1a1a1a' }}>
            {post.author_name}
          </p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>
            Researcher · {new Date(post.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Researcher controls */}
        {role === 'researcher' && isOwnPost && post.state !== 'closed' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{ backgroundColor: '#96DDA5', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              <i className="bi bi-pencil"></i>
            </button>

          </div>
        )}
      </div>

      {/* Edit modal */}
      {isEditing && createPortal(
        <EditPost
          post={post}
          setPosts={setPosts}
          onClose={() => setIsEditing(false)}
          handleClose={handleClose}
        />,
        document.body
      )}

      {/* Title */}
      <h5 style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.4rem', color: '#1a1a1a' }}>
        {post.title}
      </h5>

      {/* Body */}
      <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: '1.6', marginBottom: '0.75rem' }}>
        {post.body}
      </p>

      {/* Meta info */}
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem' }}>
        <span><i className="bi bi-calendar3"></i> {post.start_date}</span>
        <span><i className="bi bi-people"></i> {post.max_participants} participants</span>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
        {post.tags && post.tags.map(tag => (
          <span key={tag} style={{
            padding:         '0.2rem 0.6rem',
            borderRadius:    '999px',
            backgroundColor: '#eff6ff',
            color:           '#96DDA5',
            fontSize:        '0.75rem',
            fontWeight:      '500',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Image */}
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          style={{ width: '100%', borderRadius: '8px', marginBottom: '0.75rem', maxHeight: '300px', objectFit: 'cover' }}
        />
      )}



      {/* Divider */}
      <hr style={{ borderColor: '#e5e7eb', margin: '0.75rem 0' }} />

      {/* Bookmark and apply row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {role === 'general_user' && (
          <button
            onClick={handleBookmark}
            style={{
              background:   'none',
              border:       'none',
              cursor:       'pointer',
              color:        bookmarked ? '#2563eb' : '#6b7280',
              fontSize:     '0.85rem',
              display:      'flex',
              alignItems:   'center',
              gap:          '0.3rem',
              padding:      '0.3rem 0.5rem',
              borderRadius: '6px',
            }}
          >
            <i className={`bi bi-bookmark${bookmarked ? '-fill' : ''}`}></i>
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
        )}

        {/* Apply section */}
        <div style={{ marginLeft: 'auto' }}>
          {!isAuthenticated ? (
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              <a href="/login" style={{ color: '#2563eb' }}>Log in</a> to apply.
            </p>
          ) : role === 'general_user' && post.state !== 'closed' ? (
            <>
              {applied ? (
                <span style={{ color: '#16a34a', fontSize: '0.85rem' }}>
                  <i className="bi bi-check-circle"></i> Applied
                </span>
              ) : post.max_participants === 0 ? (
                <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>No spots remaining</span>
                          ) : showPreApply ? (
              <>
                {/* Backdrop */}
                <div
                  onClick={() => setShowPreApply(false)}
                  style={{
                    position:        'fixed',
                    inset:           0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    zIndex:          999,
                  }}
                />

                {/* Pre-apply modal */}
                <div style={{
                  position:        'fixed',
                  top:             '50%',
                  left:            '50%',
                  transform:       'translate(-50%, -50%)',
                  backgroundColor: '#fff',
                  borderRadius:    '12px',
                  padding:         '1.5rem',
                  width:           '90%',
                  maxWidth:        '420px',
                  zIndex:          1000,
                  boxShadow:       '0 8px 24px rgba(0,0,0,0.15)',
                }}>
                  <h6 style={{ marginBottom: '0.75rem' }}>Before you apply</h6>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <input type="checkbox" name="has_read_post" checked={preApplyForm.has_read_post} onChange={handlePreApplyChange} />
                    I have read the research post thoroughly
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <input type="checkbox" name="meets_requirements" checked={preApplyForm.meets_requirements} onChange={handlePreApplyChange} />
                    I meet the requirements for this research
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                    <input type="checkbox" name="has_consented" checked={preApplyForm.has_consented} onChange={handlePreApplyChange} />
                    I consent to participate in this research
                  </label>

                  {preApplyError && <p style={{ color: 'red', fontSize: '0.8rem' }}>{preApplyError}</p>}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={handleFinalApply}
                      style={{ backgroundColor: '#96DDA5', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Confirm & Apply
                    </button>
                    <button
                      onClick={() => setShowPreApply(false)}
                      style={{ backgroundColor: '#f3f4f6', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
              ) : (
                <button
                  onClick={() => setShowPreApply(true)}
                  style={{
                    backgroundColor: '#2563eb',
                    color:           'white',
                    border:          'none',
                    padding:         '0.4rem 1rem',
                    borderRadius:    '6px',
                    cursor:          'pointer',
                    fontSize:        '0.85rem',
                  }}
                >
                  Apply
                </button>
              )}
              {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
            </>
          ) : role === 'general_user' && post.state === 'closed' ? (
            <span style={{ color: '#dc2626', fontSize: '0.85rem' }}>This post is no longer accepting applications.</span>
          ) : null}
        </div>
      </div>
    </div>
  </div>
)}

