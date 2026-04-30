import { useState,  useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, APIError } from "../api";

const TAG_OPTIONS = [
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
];


export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roleSelected, setRoleSelected] = useState(false);
  const [showTagDropdown, setShowTagDropdown]           = useState(false);
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);
  const tagRef      = useRef(null);
  const interestRef = useRef(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    password2: "",
    role:       "",
    researchArea: "",
    bio: "",
    tags: [],
    ageRange: "",
    interests: [],
  });


    useEffect(() => {
    function handleClickOutside(e) {
      if (tagRef.current && !tagRef.current.contains(e.target)) {
        setShowTagDropdown(false)
      }
      if (interestRef.current && !interestRef.current.contains(e.target)) {
        setShowInterestDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");  // To clear user error on input
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

  function toggleInterest(tag) {
    setForm(prev => {
      const selected = prev.interests.includes(tag)
      return {
        ...prev,
        interests: selected ? prev.interests.filter(t => t !== tag) : [...prev.interests, tag]
      }
    })
  }

  function validate() {
    if (!form.firstName.trim()) return 'First name is required.'
    if (!form.lastName.trim())  return 'Last name is required.'
    if (!form.email.trim())     return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Please enter a valid email address.'
    if (!form.password)         return 'Password is required.'
    if (form.password.length < 8)
      return 'Password must be at least 8 characters.'
    if (!/[A-Z]/.test(form.password))
      return 'Password must contain at least one uppercase letter.'
    if (!/[0-9]/.test(form.password))
      return 'Password must contain at least one number.'
    if (!/[!@#$%^&*]/.test(form.password))
      return 'Password must contain at least one special character (!@#$%^&*).'
    if (form.password !== form.password2)
      return 'Passwords do not match.'
    if (form.role === 'researcher') {
      if (!form.researchArea.trim()) return 'Research area is required.'
      if (!form.bio.trim())          return 'Bio is required.'
      if (form.tags.length === 0)    return 'Please select at least one tag.'
    }
    if (form.role === 'general_user') {
      if (!form.ageRange)              return 'Please select an age range.'
      if (form.interests.length === 0) return 'Please select at least one interest.'
    }
    return null
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError("");
    setIsLoading(true);

    const payload = {
      first_name: form.firstName,
      last_name:  form.lastName,
      email:      form.email,
      password:   form.password,
      password2:  form.password2,
      role:       form.role,
      researcher_profile: form.role === 'researcher' ? {
        bio:           form.bio,
        research_area: form.researchArea,
        tags:          form.tags,
      } : undefined,
      general_profile: form.role === 'general_user' ? {
        age_range: form.ageRange,
        tags:      form.interests,
      } : undefined,
    }

    try {
      await apiRequest("/users/register/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      navigate("/login");
    } catch (err) {
      if (err instanceof APIError) {
        if (err.status === 0) {
          setError("Cannot connect to server. Is Django running?"); //Unit test for server
        } else if (err.details && err.details.email) {
          setError(err.details.email[0]);
        } else {
          setError(err.message || "Registration failed");
        }
      } else {
        setError("An unexpected error occurred");
      }
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const isResearcher = form.role === "researcher";

// Tag dropdown
  const TagDropdown = ({ tags, onToggle, showDropdown, setShowDropdown, dropdownRef, placeholder }) => (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(prev => !prev)}
        style={{
          width:           '100%',
          textAlign:       'left',
          backgroundColor: '#fff',
          border:          '1px solid #d1d5db',
          borderRadius:    '6px',
          padding:         '0.4rem 0.65rem',
          fontSize:        '0.78rem',
          fontFamily:      'Inter, sans-serif',
          cursor:          'pointer',
          color:           tags.length > 0 ? '#111' : '#9ca3af',
        }}
      >
        {tags.length > 0 ? `${tags.length} selected` : placeholder}
        <i className="bi bi-chevron-down" style={{ float: 'right', marginTop: '2px' }}></i>
      </button>

      {showDropdown && (
        <div style={{
          position:        'absolute',
          top:             '100%',
          left:            0,
          right:           0,
          backgroundColor: '#fff',
          border:          '1px solid #d1d5db',
          borderRadius:    '6px',
          zIndex:          500,
          maxHeight:       '200px',
          overflowY:       'auto',
          boxShadow:       '0 4px 12px rgba(0,0,0,0.1)',
          marginTop:       '2px',
        }}>
          {TAG_OPTIONS.map(tag => {
            const selected = tags.includes(tag)
            return (
              <div
                key={tag}
                onClick={() => onToggle(tag)}
                style={{
                  padding:         '0.4rem 0.65rem',
                  fontSize:        '0.78rem',
                  cursor:          'pointer',
                  backgroundColor: selected ? '#eff6ff' : 'transparent',
                  color:           selected ? '#2563eb' : '#111',
                  display:         'flex',
                  alignItems:      'center',
                  gap:             '0.5rem',
                }}
              >
                <i className={`bi bi-${selected ? 'check-square-fill' : 'square'}`}></i>
                {tag}
              </div>
            )
          })}
        </div>
      )}

      {/* Selected tags display */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
          {tags.map(tag => (
            <span
              key={tag}
              onClick={() => onToggle(tag)}
              style={{
                padding:         '0.15rem 0.5rem',
                borderRadius:    '999px',
                backgroundColor: '#2563eb',
                color:           'white',
                fontSize:        '0.7rem',
                cursor:          'pointer',
              }}
            >
              {tag} ×
            </span>
          ))}
        </div>
      )}
    </div>
  )

  if (!roleSelected) {
    return (
      <div className="auth-page">
        <div className="auth-layout">
          <div className="auth-form">
            <h1>Welcome</h1>
            <p style={{ fontSize: '1rem', color: '#374151', marginBottom: '1rem' }}>Are you a</p>

            <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="radio"
                  name="role"
                  value="general_user"
                  checked={form.role === 'general_user'}
                  onChange={() => setForm({ ...form, role: 'general_user' })}
                />
                General User
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="radio"
                  name="role"
                  value="researcher"
                  checked={form.role === 'researcher'}
                  onChange={() => setForm({ ...form, role: 'researcher' })}
                />
                Researcher
              </label>
            </div>

            <button
              onClick={() => {
                if (!form.role) { setError('Please select a role.'); return }
                setError('')
                setRoleSelected(true)
              }}
              style={{
                backgroundColor: '#111',
                color:           'white',
                border:          'none',
                padding:         '0.5rem 1.25rem',
                borderRadius:    '6px',
                cursor:          'pointer',
                fontSize:        '0.875rem',
                fontFamily:      'Inter, sans-serif',
              }}
            >
              Continue
            </button>
            {error && <p style={{ color: 'red', fontSize: '0.78rem', marginTop: '0.5rem' }}>{error}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <div className="auth-form" style={{ maxWidth: isResearcher ? '700px' : '380px' }}>
          <h1>Create an Account</h1>

          {/* First two columns: basic info side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="password2" value={form.password2} onChange={handleChange} required />
            </div>
          </div>

          {/* Two column layout for role specific fields */}
          {isResearcher && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div className="form-group">
                <label>Research Area</label>
                <input type="text" name="researchArea" value={form.researchArea} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Tags</label>
                <TagDropdown
                  tags={form.tags}
                  onToggle={toggleTag}
                  showDropdown={showTagDropdown}
                  setShowDropdown={setShowTagDropdown}
                  dropdownRef={tagRef}
                  placeholder="Select tags..."
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} required />
              </div>
            </div>
          )}

          {!isResearcher && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div className="form-group">
                <label>Age Range</label>
                <select name="ageRange" value={form.ageRange} onChange={handleChange} required>
                  <option value="">Select age range</option>
                  <option value="18-25">18–25</option>
                  <option value="26-35">26–35</option>
                  <option value="36-45">36–45</option>
                  <option value="46-55">46–55</option>
                  <option value="56-60">56–60</option>
                </select>
              </div>
              <div className="form-group">
                <label>Interests</label>
                <TagDropdown
                  tags={form.interests}
                  onToggle={toggleInterest}
                  showDropdown={showInterestDropdown}
                  setShowDropdown={setShowInterestDropdown}
                  dropdownRef={interestRef}
                  placeholder="Select interests..."
                />
              </div>
            </div>
          )}

          {error && <p style={{ color: 'red', fontSize: '0.78rem', marginTop: '0.5rem' }}>{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              backgroundColor: '#111',
              color:           'white',
              border:          'none',
              padding:         '0.5rem 1.25rem',
              borderRadius:    '6px',
              cursor:          'pointer',
              fontSize:        '0.875rem',
              fontFamily:      'Inter, sans-serif',
              marginTop:       '1rem',
            }}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>

          <p style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.75rem' }}>
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '500' }}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}