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
    if (validationError){
      setError(validationError)
      return
    }
  setError("")
  setIsLoading(true)

  try {
    const data = await apiRequest("/users/login/", {
      method: "POST",
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    })

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

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "1rem" }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </label>

        {error && (
          <p style={{ color: "red", padding: "0.5rem", backgroundColor: "#ffe6e6", borderRadius: "4px" }}>
            {error}
          </p>
        )}

        <button 
          type="submit" 
          style={{ marginTop: "1rem" }}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}