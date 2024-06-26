import List from "./components/list/List"
import Detail from "./components/detail/Detail"
import Chat from "./components/chat/Chat"

const App = () => {
  return (
    <div className='container'>
      <List />
      <Chat />
      <Detail />
    </div>
  )
}

export default App