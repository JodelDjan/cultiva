const BASE_URL = 'http://localhost:8000/api'
const token = () => localStorage.getItem('token')

export const getPosts = () =>
  apiRequest('/posts/')

export const createPost = (formData) =>
  apiRequest('/posts/create/', {
    method: 'POST',
    body: JSON.stringify({
      title:            formData.title,
      body:             formData.body,
      tags:             formData.tags,
      max_participants: formData.max_participants,
      start_date:       formData.start_date,
    })
  })

export const searchPosts = (query) =>
  apiRequest(`/posts/search/?q=${query}`)

export const applyToPost = (postId) =>
  fetch(`${BASE_URL}/posts/${postId}/apply/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`
    }
  }).then(res => res.json())

  export class APIError extends Error {
  constructor(message, status, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const apiRequest = async (endpoint, options = {}) => {
  const authToken = token()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  })

  const data = await response.json()

  if (!response.ok) {
    throw new APIError(
      data.detail || 'Request failed',
      response.status,
      data
    )
  }

  return data
}

export const getProfile = () =>
  apiRequest('/users/profile/')

export const getResearchers = () =>
  apiRequest('/users/directory/')

export const getDashboard = () =>
  apiRequest('/posts/dashboard/')