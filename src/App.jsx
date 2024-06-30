import List from "./components/list/List"
import Detail from "./components/detail/Detail"
import Chat from "./components/chat/Chat"
import Login from "./components/login/Login";
import Notification from "./components/notifiction/Notification";
import "react-toastify/dist/ReactToastify.css"

const App = () => {
 
  const user = false;
  return (
    <div className='container'>
      {user ? (
        <>
          <List />
          <Chat />
          <Detail />
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  )
}

export default App