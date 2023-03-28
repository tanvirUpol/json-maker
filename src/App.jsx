import { useState } from 'react'
import JsonConverter from './components/JsonConverter'


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <JsonConverter/>
    </div>
  )
}

export default App
