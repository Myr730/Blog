import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  function handleUsernameChange(e){
    setUsername(e.target.value);
  }

  function handlePasswordChange(e){
    setPassword(e.target.value);
  }

  function handleSubmit(){
    const formInfo = new FormData();
    formInfo.append("username", username);
    formInfo.append("password", password);

    fetch("http://localhost:8000/login", {
      method: "POST",
      credentials: "include",
      body: formInfo,
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      navigate('/autores/' + data.id_author);
    })
    .catch((error) => {console.log(error);})
  }

  return(
    <div className="login">
      <h1>Login</h1>
      <label>Usuario:</label>
      <input type="text" value={username} onChange={handleUsernameChange}></input>
      <label>Contraseña:</label>
      <input type="password" value={password} onChange={handlePasswordChange}></input>
      <input type="submit" value="Entrar" onClick={handleSubmit} className="submit"></input>
    </div>
  );
}