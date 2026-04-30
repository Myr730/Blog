import { useState, useEffect } from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate
} from "react-router-dom"
import "./App.css"
import Login from './Login'
import PrivateRoute from './PrivateRoute'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

function Card({ titulo, descripcion, imagen, id_post }) {
  return (
    <div className="card">
      <Link to={`/blog/${id_post}`}>
        <img src={imagen} alt={titulo} />
        <h2>{titulo}</h2>
      </Link>
    </div>
  )
}

// NAVBAR
function Navbar() {
  return (
    <nav>
      <Link to="/">Inicio</Link>
      <Link to="/blog">Blog</Link>
      <Link to="/contacto">Contacto</Link>
    </nav>
  )
}

// INICIO
function Inicio() {
  return (
    <div className="inicio">
      <h2>Bienvenidous a mi blog</h2>

      <img
        src="/perfil.png"
        alt="foto"
        className="imagen-circular"
      />
    </div>
  )
}

// BLOG 
function Blog() {
  const [entries, setEntries] = useState([])
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    fetch(`${API_URL}/posts`)
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch((error) => console.log(error))
  }, [])

  const filtrados = entries.filter((post) =>
    post.title.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <>
      <h1>Blog de películas</h1>

      <input
        type="text"
        placeholder="Buscar película..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {filtrados.length > 0 ? (
        <div className="cards-container">
          {filtrados.map((post) => (
            <Card
              key={post.id_post}
              id_post={post.id_post}
              titulo={post.title}
              descripcion={post.text}
              imagen={post.image}
             />
          ))}
        </div>
      ) : (
        <p>No se encontró esa película</p>
      )}
    </>
  )
}

// CONTACTO
function Contacto() {
  return (
    <>
      <h2>Contacto</h2>
      <p>Myrka Santiago Lopez</p>
      <p>A01735601@tec.mx</p>
    </>
  )
}

function Post() {
  const { id_post } = useParams()
  const [post, setPost] = useState({})

  useEffect(() => {
    fetch(`${API_URL}/posts/${id_post}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((error) => console.log(error))
  }, [id_post])

  return (
    <>
      {post.image && <img src={post.image} alt="Imagen del post" />}

      <h1>{post.title}</h1>
      <h2>Obras de arte, Ciencia ficción, {post.id_author}</h2>
      <h3>Estrenada el:,{post.date?.substring(0, 10)}</h3>
      <p>{post.text}</p>
    </>
  )
}

function NewPost() {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [text, setText] = useState('')
  const [img, setImg] = useState(null)

  function handleFile(e) {
    setImg(e.target.files[0])
  }

  function handleSubmit() {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('date', date)
    formData.append('text', text)
    formData.append('img', img)

    fetch(`${API_URL}/posts/new`, {
      method: 'POST',
      body: formData
    })
      .then(() => {
        alert('Post agregado ')
        window.location.href = '/blog'
      })
      .catch((error) => console.log(error))
  }

  return (
    <div className="form">
      <h2>Nuevo Post</h2>

      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="date"
        placeholder="Fecha de estreno"
        value={Date}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Texto del post"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <input type="file" onChange={handleFile} />

      <button onClick={handleSubmit}>Agregar</button>
    </div>
  )
}

function Author() {
  const { id_author } = useParams()
  const [author, setAuthor] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_URL}/authors/` + id_author, {
      method: "GET",
      credentials: "include"
    })
    .then((res) => {
      if (res.status == 401) {
        navigate('/login');
      }
      return res.json()
    })
    .then((data) => setAuthor(data))
    .catch((error) => console.log(error))
  }, [id_author, navigate])

  return (
    <>
      <h1>{author.name} {author.lastname}</h1>
      <p>Email: {author.email}</p>
      <p>Teléfono: {author.phone_number}</p>
      <p>Fecha de nacimiento: {author.date_of_birth}</p>
    </>
  )
}
// APP
function App() {
  return (
    <Router>
      <Navbar />
      <Link to="/blog/nuevo/">Nuevo Post</Link>

      <Routes>
        <Route path='/login' element={<Login />} />

        <Route path='/' element={<PrivateRoute><Inicio /></PrivateRoute>} />
        <Route path='/blog' element={<PrivateRoute><Blog /></PrivateRoute>} />
        <Route path='/contacto' element={<PrivateRoute><Contacto /></PrivateRoute>} />
        <Route path='/blog/:id_post' element={<PrivateRoute><Post /></PrivateRoute>} />
        <Route path='/blog/nuevo/' element={<PrivateRoute><NewPost /></PrivateRoute>} />
        <Route path='/autores/:id_author' element={<PrivateRoute><Author /></PrivateRoute>} />
      </Routes>
    </Router>
  )
}

export default App