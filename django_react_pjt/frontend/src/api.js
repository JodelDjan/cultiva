const BASE_URL = 'http://localhost:8000/api'
const token = () => localStorage.getItem('token')

export class APIError extends Error {
  constructor(message, status, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
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

export const getPosts = (tag = '') =>
  apiRequest(`/posts/${tag ? `?tag=${encodeURIComponent(tag)}` : ''}`)

export const createPost = (formData, notify = false) => {
  const data = new FormData()
  data.append('title',            formData.title)
  data.append('body',             formData.body)
  data.append('start_date',       formData.start_date)
  data.append('max_participants', formData.max_participants)
  data.append('state',            formData.state || 'open')
  data.append('research_link',    formData.research_link || '')
  data.append('tags',             JSON.stringify(formData.tags))
  data.append('notify_matching',  notify)
  if (formData.image) data.append('image', formData.image)

  const authToken = localStorage.getItem('token')
  return fetch(`${BASE_URL}/posts/create/`, {
    method:      'POST',
    credentials: 'include',
    headers:     { Authorization: `Bearer ${authToken}` },
    body:        data,
  }).then(res => res.json())
}
export const reopenPost = (postId) =>
  apiRequest(`/posts/${postId}/reopen/`, { method: 'PATCH' })

export const searchPosts = (query) =>
  apiRequest(`/posts/search/?q=${query}`)

export const applyToPost = (postId) =>
  apiRequest(`/posts/${postId}/apply/`, {
    method: 'POST',
  })

export const getProfile = () =>
  apiRequest('/users/profile/')

export const getResearchers = () =>
  apiRequest('/users/directory/')

export const getDashboard = () =>
  apiRequest('/posts/dashboard/')

export const editPost = (postId, formData) => {
  const data = new FormData()
  data.append('title',            formData.title)
  data.append('body',             formData.body)
  data.append('start_date',       formData.start_date)
  data.append('max_participants', formData.max_participants)
  data.append('research_link',    formData.research_link || '')
  formData.tags.forEach(tag => data.append('tags', tag))
  if (formData.image) data.append('image', formData.image)

  const authToken = localStorage.getItem('token')
  return fetch(`${BASE_URL}/posts/${postId}/edit/`, {
    method:  'PATCH',
    headers: { Authorization: `Bearer ${authToken}` },
    body:    data,
  }).then(res => res.json())
}

export const closePost = (postId) =>
  apiRequest(`/posts/${postId}/close/`, { method: 'PATCH' })

export const getPublicProfile = (userId) =>
  apiRequest(`/users/profile/${userId}/`)

export const updateProfile = (formData) =>
  apiRequest('/users/profile/edit/', {
    method: 'PATCH',
    body: JSON.stringify(formData)
  })

export const withdrawApplication = (postId) =>
  apiRequest(`/posts/${postId}/withdraw/`, { method: 'DELETE' })

export const getApplications = () =>
  apiRequest('/posts/applications/')

export const bookmarkPost = (postId) =>
  apiRequest(`/posts/${postId}/bookmark/`, { method: 'POST' })

export const removeBookmark = (postId) =>
  apiRequest(`/posts/${postId}/bookmark/`, { method: 'DELETE' })

export const getBookmarks = () =>
  apiRequest('/posts/bookmarks/')

export const getNotifications = () =>
  apiRequest('/posts/notifications/') 

export const deletePost = (postId) =>
  apiRequest(`/posts/${postId}/delete/`, { method: 'DELETE' })

export const logout = () =>
  apiRequest('/users/logout/', { method: 'POST' })