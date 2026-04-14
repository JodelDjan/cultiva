import { useState, useEffect } from 'react'
import { getPosts } from '../api'
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'
import Feed from '../components/Feed'
import CreatePost from '../components/CreatePost'

export default function Home() {
  const navigate  = useNavigate('/login') //,{replace: true})
  const role      = localStorage.getItem('role')
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    getPosts()
      .then(data => {
        if (Array.isArray(data)) setPosts(data)
      })
      .catch(err => console.error(err))
  }, [])

  return (
    <div>
      <Navbar setPosts={setPosts} />
      {role === 'researcher' && <CreatePost setPosts={setPosts} />}
      <Feed posts={posts} />
    </div>
  )
}