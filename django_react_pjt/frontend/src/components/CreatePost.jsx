import { useState } from 'react'
import { createPost, getPosts } from '../api'

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

export default function CreatePost({ setPosts }) {
  const [isOpen, setIsOpen]   = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm]       = useState({
    title:           '',
    body:            '',
    tags:            [],
    max_participants: '',
    start_date:      '',
    research_link:   '',
    image:          null,
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  function handleImageChange(e) {
  setForm({ ...form, image: e.target.files[0] })
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

  async function handleSubmit() {
    if (!form.title.trim()) return setError('Title is required.')
    if (!form.body.trim())  return setError('Body is required.')
    if (form.tags.length === 0) return setError('Please select at least one tag.')

    try {
      await createPost(form)
      getPosts().then(data => {
        if (Array.isArray(data)) setPosts(data)
      })
      setIsOpen(false)
      setForm({ title: '', body: '', tags: [], max_participants: '', start_date: '' })
      setError('')
    } catch (err) {
      setError('Failed to create post. Please try again.')
    }
  }

  return (
    <div>
      {/* + Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position:     'fixed',
          bottom:       '2rem',
          right:        '2rem',
          width:        '56px',
          height:       '56px',
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          color:        'white',
          fontSize:     '2rem',
          border:       'none',
          cursor:       'pointer',
          boxShadow:    '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        +
      </button>

      {/* Modal */}
      {isOpen && (
        <div style={{
          position:        'fixed',
          inset:           0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          zIndex:          1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius:    '12px',
            padding:         '2rem',
            width:           '100%',
            maxWidth:        '500px',
            maxHeight:       '90vh',
            overflowY:       'auto',
          }}>
            <h2>New Post</h2>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
              Title *
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
              Body *
              <textarea
                name="body"
                value={form.body}
                onChange={handleChange}
                rows={4}
                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
              />
            </label>

            <div style={{ marginBottom: '1rem' }}>
              <div>Tags * </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {TAG_OPTIONS.map(tag => {
                  const selected = form.tags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding:         '0.3rem 0.6rem',
                        borderRadius:    '999px',
                        border:          selected ? '1px solid #2563eb' : '1px solid #ccc',
                        backgroundColor: selected ? '#2563eb' : '#f5f5f5',
                        color:           selected ? 'white' : 'black',
                        cursor:          'pointer',
                        fontSize:        '0.8rem',
                      }}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
              Max Participants
              <input
                type="number"
                name="max_participants"
                value={form.max_participants}
                onChange={handleChange}
                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
              Start Date
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
              />
            </label>

            {error && <p style={{ color: 'red' }}>{error}</p>}
                
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              Research Link
              <input
                type="url"
                name="research_link"
                value={form.research_link}
                onChange={handleChange}
                placeholder="https://..."
                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
              />
            </label>
            
           {/*Upload images with post */}
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              Upload Image (optional)
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'block', marginTop: '0.25rem' }}
              />
            </label>

            {form.image && (
              <img
                src={URL.createObjectURL(form.image)}
                alt="Preview"
                style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }}
              />
            )}

            {/*Display the image if it exists*/}
            {post.image && (
              <img
                src={`http://localhost:8000${post.image}`}
                alt={post.title}
                style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }}
              />
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={handleSubmit}
                style={{
                  backgroundColor: '#2563eb',
                  color:           'white',
                  border:          'none',
                  padding:         '0.5rem 1.5rem',
                  borderRadius:    '6px',
                  cursor:          'pointer',
                }}
              >
                Post
              </button>
              <button
                onClick={() => { setIsOpen(false); setError('') }}
                style={{
                  backgroundColor: '#f3f4f6',
                  border:          'none',
                  padding:         '0.5rem 1.5rem',
                  borderRadius:    '6px',
                  cursor:          'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}