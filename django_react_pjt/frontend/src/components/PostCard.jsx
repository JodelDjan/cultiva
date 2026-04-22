import { useState } from 'react'
import { applyToPost, editPost, closePost } from '../api'



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

export default function PostCard({ post, setPosts, getPosts }) {
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
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>

      {/* Closed badge */}
      {post.state === 'closed' && (
        <span style={{
          backgroundColor: '#fee2e2',
          color:           '#dc2626',
          padding:         '0.2rem 0.6rem',
          borderRadius:    '999px',
          fontSize:        '0.75rem',
          marginBottom:    '0.5rem',
          display:         'inline-block'
        }}>
          Closed
        </span>
      )}

      {/* Edit form */}
      {isEditing ? (
        <div>
          <label>Title
            <input type="text" name="title" value={form.title} onChange={handleChange}
              style={{ display: 'block', width: '100%' }} />
          </label>

          <label>Body
            <textarea name="body" value={form.body} onChange={handleChange}
              rows={4} style={{ display: 'block', width: '100%' }} />
          </label>

          <div>
            <div>Tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {TAG_OPTIONS.map(tag => {
                const selected = form.tags.includes(tag)
                return (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{
                    padding: '0.3rem 0.6rem', borderRadius: '999px',
                    border: selected ? '1px solid #2563eb' : '1px solid #ccc',
                    backgroundColor: selected ? '#2563eb' : '#f5f5f5',
                    color: selected ? 'white' : 'black',
                    cursor: 'pointer', fontSize: '0.8rem',
                  }}>
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          <label>Max Participants
            <input type="number" name="max_participants" value={form.max_participants}
              onChange={handleChange} style={{ display: 'block', width: '100%' }} />
          </label>

          <label>Start Date
            <input type="date" name="start_date" value={form.start_date}
              onChange={handleChange} style={{ display: 'block', width: '100%' }} />
          </label>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          <label>Research Link
            <input
              type="url"
              name="research_link"
              value={form.research_link}
              onChange={handleChange}
              placeholder="https://..."
              style={{ display: 'block', width: '100%' }}
            />
          </label>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button onClick={handleEdit} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
              Save
            </button>
            <button onClick={() => setIsEditing(false)} style={{ backgroundColor: '#f3f4f6', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>

      ) : (

        /* Post display */
        <div>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
          <p>Start Date: {post.start_date}</p>
          <p>Tags: {post.tags && post.tags.join(', ')}</p>
          <p>Created: {new Date(post.created_at).toLocaleDateString()}</p>
          <p>Max Participants: {post.max_participants}</p>
          <p>Posted by: {post.author_name}</p>

          {/* Researcher controls — only on their own posts */}
          
          {role === 'researcher' && isOwnPost && post.state !== 'closed' && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{ backgroundColor: '#f3f4f6', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
              >
                Edit
              </button>
              <button
                onClick={handleClose}
                style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
              >
                Close Post
              </button>
            </div>
          )}

{/* Apply form for general users */}
{!isAuthenticated ? (
  <p><a href="/login">Log in</a> to apply to this post.</p>

) : role === 'general_user' && post.state !== 'closed' ? (
  <>
    {applied ? (
      <p>Application submitted successfully.</p>
    ) : showPreApply ? (
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '0.75rem' }}>Before you apply</h4>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="checkbox"
            name="has_read_post"
            checked={preApplyForm.has_read_post}
            onChange={handlePreApplyChange}
          />
          I have read the research post thoroughly
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="checkbox"
            name="meets_requirements"
            checked={preApplyForm.meets_requirements}
            onChange={handlePreApplyChange}
          />
          I meet the requirements for this research
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input
            type="checkbox"
            name="has_consented"
            checked={preApplyForm.has_consented}
            onChange={handlePreApplyChange}
          />
          I consent to participate in this research
        </label>

        {preApplyError && <p style={{ color: 'red', fontSize: '0.85rem' }}>{preApplyError}</p>}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleFinalApply}
            style={{
              backgroundColor: '#2563eb', color: 'white',
              border: 'none', padding: '0.5rem 1rem',
              borderRadius: '6px', cursor: 'pointer'
            }}
          >
            Apply
          </button>
          <button
            onClick={() => setShowPreApply(false)}
            style={{
              backgroundColor: '#f3f4f6', border: 'none',
              padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>

    ) : (
      <button
        onClick={() => setShowPreApply(true)}
        style={{
          backgroundColor: '#2563eb', color: 'white',
          border: 'none', padding: '0.5rem 1rem',
          borderRadius: '6px', cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        Apply
      </button>
    )}
    {error && <p style={{ color: 'red' }}>{error}</p>}
  </>

) : role === 'general_user' && post.state === 'closed' ? (
  <p style={{ color: '#dc2626' }}>This post is no longer accepting applications.</p>
) : null}
  
    </div>
  )
}
</div>)}