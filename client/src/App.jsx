import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>Task Tracker</h1>
          <p>Stay organised. Get things done.</p>
        </div>
      </header>
      <main className="container">
        <Home />
      </main>
    </div>
  );
}

export default App;
