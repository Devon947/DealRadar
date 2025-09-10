import { Routes, Route, Link } from "react-router-dom";
import Auth from "./pages/Auth";

function Home() {
  return (
    <div style={{padding:16, fontFamily:"system-ui, sans-serif"}}>
      DealRadar is live 🎯
    </div>
  );
}

export default function App() {
  return (
    <div>
      <nav style={{padding:12, borderBottom:"1px solid #eee", marginBottom:16, fontFamily:"system-ui, sans-serif"}}>
        <Link to="/" style={{marginRight:12}}>Home</Link>
        <Link to="/auth">Auth</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </div>
  );
}
