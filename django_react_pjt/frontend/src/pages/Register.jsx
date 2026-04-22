import { useState } from "react";
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

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    password2: "",
    role: "general_user",
    researchArea: "",
    bio: "",
    tags: [],
    ageRange: "",
    interests: [],
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");  // Clears user error on input
  }

function toggleTag(tag) {
  setForm((prev) => {
    const selected = prev.tags.includes(tag);
    return {
      ...prev,
      tags: selected
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    };
  });
}

function toggleInterest(tag) {
  setForm((prev) => {
    const selected = prev.interests.includes(tag);
    return {
      ...prev,
      interests: selected
        ? prev.interests.filter((t) => t !== tag)
        : [...prev.interests, tag],
    };
  });
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
    e.preventDefault();
    const validationError = validate()
    if (validationError){
      setError(validationError)
      return
    }
    setError("");
    setIsLoading(true);

    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      password: form.password,
      password2: form.password2,
      role: form.role,
      researcher_profile: form.role === 'researcher' ? {
          bio:        form.bio,
          department: form.researchArea,  
          tags:       form.tags,
        } : undefined,
        general_user_profile: form.role === 'general_user' ? {
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
          setError("Cannot connect to server. Is Django running?");
        } else if (err.details && err.details.email) {
          setError(err.details.email[0]); // Email validation error
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

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "1rem" }}>
      <h1>Create an Account</h1>

      <form onSubmit={handleSubmit}>
        <label>
          First Name
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Last Name
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
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
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            name="password2"
            value={form.password2}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </label>

        <label>
          Role
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="general_user">General User</option>
            <option value="researcher">Researcher</option>
          </select>
        </label>

        {/* Researcher-only fields */}
        {isResearcher && (
          <>
            <label>
              Research Area
              <input
                type="text"
                name="researchArea"
                value={form.researchArea}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Bio
              <input
                type="text"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                required
              />
            </label>

            <div style={{ marginTop: "1rem" }}>
              <div>Select Tags (Researcher):</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {TAG_OPTIONS.map((tag) => {
                  const selected = form.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding: "0.3rem 0.6rem",
                        borderRadius: "999px",
                        border: selected
                          ? "1px solid #2563eb"
                          : "1px solid #ccc",
                        backgroundColor: selected ? "#2563eb" : "#f5f5f5",
                        color: selected ? "white" : "black",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* General-user-only fields */}
        {!isResearcher && (
          <>
            <label>
              Age Range
              <select
                name="ageRange"
                value={form.ageRange}
                onChange={handleChange}
                required
              >
                <option value="">Select age range</option>
                <option value="18-25">18–25</option>
                <option value="26-35">26–35</option>
                <option value="36-45">36–45</option>
                <option value="46-55">46–55</option>
                <option value="56-60">56–60</option>
              </select>
            </label>

            <div style={{ marginTop: "1rem" }}>
              <div>Select Interests:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {TAG_OPTIONS.map((tag) => {
                  const selected = form.interests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      style={{
                        padding: "0.3rem 0.6rem",
                        borderRadius: "999px",
                        border: selected
                          ? "1px solid #2563eb"
                          : "1px solid #ccc",
                        backgroundColor: selected ? "#2563eb" : "#f5f5f5",
                        color: selected ? "white" : "black",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={isLoading} style={{ marginTop: "1.5rem" }}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
