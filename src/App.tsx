import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SearchProvider } from "./contexts/SearchContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { PostDetail } from "./pages/PostDetail";
import { CreateEditPost } from "./pages/CreateEditPost";
import { Author } from "./pages/Author";
import { Profile } from "./pages/Profile";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SearchProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="post/:id" element={<PostDetail />} />
                  <Route path="new" element={<CreateEditPost />} />
                  <Route path="edit/:id" element={<CreateEditPost />} />
                  <Route path="author/:uid" element={<Author />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                </Route>
              </Routes>
            </Router>
          </ToastProvider>
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
