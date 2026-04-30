import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../api'
import { useNavigate } from 'react-router-dom'

const TAG_OPTIONS = [
  'Health and Fitness', 'Mental Health', 'Medicine', 'Law',
  'Technology', 'Public Health', 'Nutrition', 'Molecular Biology',
  'Pharmacology', 'Biomedical Science', 'Microbiology',
  'Anatomy and Physiology', 'Immunology', 'Environmental Science',
  'Business', 'Software Development',
]

const AGE_RANGE_OPTIONS = ['18-25', '26-35', '36-45', '46-55', '56-60']

export default function EditProfile() {
  const navigate          = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm]   = useState(null)

  useEffect(() => {
    getProfile().then(data => {
      setForm({
        first_name:    data.first_name,
        last_name:     data.last_name,
        bio:           data.bio           || '',
        research_area: data.research_area || '',
        tags:          data.tags          || [],
        age_range:     data.age_range     || '',
        role:          data.role,
      })
    })
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
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
    if (!form.first_name.trim()) return setError('First name is required.')
    if (!form.last_name.trim())  return setError('Last name is required.')
    if (form.role === 'researcher') {
      if (!form.bio.trim())           return setError('Bio is required.')
      if (!form.research_area.trim()) return setError('Research area is required.')
      if (form.tags.length === 0)     return setError('Please select at least one tag.')
    }
    if (form.role === 'general_user') {
      if (!form.age_range)        return setError('Please select an age range.')
      if (form.tags.length === 0) return setError('Please select at least one interest.')
    }

    try {
      const payload = {
        first_name: form.first_name,
        last_name:  form.last_name,
        ...(form.role === 'researcher' ? {
          bio:           form.bio,
          research_area: form.research_area,
          tags:          form.tags,
        } : {
          age_range: form.age_range,
          tags:      form.tags,
        })
      }
      await updateProfile(payload)
      setSuccess('Profile updated successfully.')
      setTimeout(() => navigate('/profile'), 1500)
    } catch (err) {
      setError('Failed to update profile. Please try again.')
    }
  }

  if (!form) return <p>Loading...</p>

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h1>Edit Profile</h1>

      {/* Shared fields */}
      <label style={{ display: 'block', marginBottom: '1rem' }}>
        First Name
        <input
          type="text"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
        />
      </label>

      <label style={{ display: 'block', marginBottom: '1rem' }}>
        Last Name
        <input
          type="text"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
        />
      </label>

      {/* Researcher fields */}
      {form.role === 'researcher' && (
        <>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Bio
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Research Area
            <input
              type="text"
              name="research_area"
              value={form.research_area}
              onChange={handleChange}
              style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
            />
          </label>

          <div style={{ marginBottom: '1rem' }}>
            <div>Tags</div>
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
                      border:          selected ? '1px solid #96DDA5' : '1px solid #ccc',
                      backgroundColor: selected ? '#96DDA5' : '#f5f5f5',
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
        </>
      )}

      {/* General user fields */}
      {form.role === 'general_user' && (
        <>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Age Range
            <select
              name="age_range"
              value={form.age_range}
              onChange={handleChange}
              style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
            >
              <option value="">Select age range</option>
              {AGE_RANGE_OPTIONS.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </label>

          <div style={{ marginBottom: '1rem' }}>
            <div>Interests</div>
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
                      border:          selected ? '1px solid #16a34a' : '1px solid #ccc',
                      backgroundColor: selected ? '#16a34a' : '#f5f5f5',
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
        </>
      )}

      {error   && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: '#96DDA5', color: 'white',
            border: 'none', padding: '0.5rem 1.5rem',
            borderRadius: '6px', cursor: 'pointer'
          }}
        >
          Save
        </button>
        <button
          onClick={() => navigate('/profile')}
          style={{
            backgroundColor: '#ff0000', border: 'none',
            padding: '0.5rem 1.5rem', borderRadius: '6px', cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}