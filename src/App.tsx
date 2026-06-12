import { Navigate, Route, Routes } from "react-router-dom";
import { Auth } from "./page/Login";
import { PrivateRoute } from "./page/PrivateRoute";
import Home from "./page/Home";


export default function App() {
  return (
    <Routes>
      <Route path="" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />

    </Routes>
  )
}
