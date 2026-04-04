import { useState, useEffect } from 'react'
import { getPosts } from '../api'
import Navbar from '../components/Navbar'
import Feed from '../components/Feed'
import CreatePost from '../components/CreatePost'

export default function Home() {
  const role = localStorage.getItem('role')
  const [posts, setPosts] = useState([])

  useEffect(() => {
    getPosts().then(data => setPosts(data))
  }, [])

  return (
    <div>
      <Navbar setPosts={setPosts} />
      {role === 'researcher' && <CreatePost setPosts={setPosts} />}
      <Feed posts={posts} />
    </div>
  )
}