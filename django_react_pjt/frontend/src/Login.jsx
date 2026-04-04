import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, getAuthHeaders, APIError } from "./utils/api";

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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Login request
      const data = await apiRequest("/accounts/login/", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      // Save tokens
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // Get user role
      const userRole = await apiRequest("/accounts/me/", {
        headers: getAuthHeaders(),
      });

      // Navigate based on role
      if (userRole.role === "researcher") {
        navigate("/");
      }

    } catch (err) {
      if (err instanceof APIError) {
        if (err.status === 0) {
          setError("Cannot connect to server. Is Django running on port 8000?");
        } else if (err.status === 401) {
          setError("Invalid email or password");
        } else {
          setError(err.message || "An error occurred during login");
        }
      } else {
        setError("An unexpected error occurred");
      }
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
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