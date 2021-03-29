import React from 'react';
import { ViewModel } from 'hardcore-react-adapters';

import './App.css';

const UserProfileVM = new ViewModel({
  state: () => {
    return {}
  }
}).build();

function App() {
  const {} = UserProfileVM();

  return (
    <div className="App">
      <header className="App-header">
        Demo
      </header>
    </div>
  )
}

export default App
