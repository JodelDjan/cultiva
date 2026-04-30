import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, APIError } from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError("");
  }

function validate() {
  if (!form.email.trim())
    return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    return 'Please enter a valid email address.'
  if (!form.password)
    return 'Password is required.'
  if (form.password.length < 8)
    return 'Password must be at least 8 characters.'
  return null
}

async function handleSubmit(e) {
  e.preventDefault()
  const validationError = validate()
  if (validationError) {
    setError(validationError)
    return
  }
  setError("")
  setIsLoading(true)

  try {
    const data = await apiRequest("/users/login/", {
      method: "POST",
      body: JSON.stringify({
        email:    form.email,
        password: form.password,
      }),
    })

    console.log('Login response:', data)

    localStorage.setItem('token',      data.access)
    localStorage.setItem('role',       data.role)
    localStorage.setItem('first_name', data.first_name)
    localStorage.setItem('last_name',  data.last_name)

    if (data.role === 'researcher') {
      navigate('/')
    } else {
      navigate('/')
    }

  } catch (err) {
    if (err instanceof APIError) {
      if (err.status === 0) {
        setError("Cannot connect to server. Is Django running on port 8000?")
      } else if (err.status === 401) {
        setError("Invalid email or password")
      } else {
        setError(err.message || "An error occurred during login")
      }
    } else {
      setError("An unexpected error occurred")
    }
    console.error("Login error:", err)
  } finally {
    setIsLoading(false)
  }
}



    if (data.role === 'researcher') {
      navigate('/')
    } else {
      navigate('/')
    }

  } catch (err) {
    if (err instanceof APIError) {
      if (err.status === 0) {
        setError("Cannot connect to server. Is Django running on port 8000?")
      } else if (err.status === 401) {
        setError("Invalid email or password")
      } else {
        setError(err.message || "An error occurred during login")
      }
    } else {
      setError("An unexpected error occurred")
    }
    console.error("Login error:", err)
  } finally {
    setIsLoading(false)
  }
}

return (
  <div className="auth-page">
    <div className="auth-layout">
      <div className="auth-form">
        <h1>Sign In</h1>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <p style={{ color: 'red', fontSize: '0.875rem' }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            backgroundColor: '#111',
            color:           'white',
            border:          'none',
            padding:         '0.65rem 1.5rem',
            borderRadius:    '6px',
            cursor:          'pointer',
            fontWeight:      '500',
            fontSize:        '0.95rem',
            fontFamily:      'Inter, sans-serif',
            marginTop:       '0.5rem',
          }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '500' }}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  </div>
)}