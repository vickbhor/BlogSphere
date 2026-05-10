// Replace your current App.jsx with this updated version

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import React, { Suspense } from 'react'
import { ThemeProvider } from './components/ThemeProvider'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LenisProvider from './components/LenisProvider'
import { AuthProvider } from './context/AuthContext'
import { ToastContainer } from './components/Toast'
import { Loader2 } from 'lucide-react'

const Home = React.lazy(() => import('./pages/Home'))
const Post = React.lazy(() => import('./pages/Post'))
const About = React.lazy(() => import('./pages/About'))
const Blogs = React.lazy(() => import('./pages/Blogs'))
const Authors = React.lazy(() => import('./pages/Authors'))
const Login = React.lazy(() => import('./pages/Login'))
const Register = React.lazy(() => import('./pages/Register'))
const OtpVerify = React.lazy(() => import('./pages/OtpVerify'))
const MyProfile = React.lazy(() => import('./pages/MyProfile'))
const WriteBlog = React.lazy(() => import('./pages/WriteBlog'))
const AuthorProfile = React.lazy(() => import('./pages/AuthorProfile'))
const SavedPosts = React.lazy(() => import('./pages/SavedPosts'))
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'))

function PageLoader() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="velora-theme">
      <AuthProvider>
        <LenisProvider>
          <Router>
            <ToastContainer />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 pt-24">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/post/:slug" element={<Post />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/authors" element={<Authors />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-otp" element={<OtpVerify />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route
                      path="/password/reset/:token"
                      element={<ResetPassword />}
                    />
                    <Route path="/my-profile" element={<MyProfile />} />
                    <Route path="/write-blog" element={<WriteBlog />} />
                    <Route path="/write-blog/:id" element={<WriteBlog />} />
                    <Route
                      path="/author-profile/:authorId"
                      element={<AuthorProfile />}
                    />
                    <Route path="/saved-posts" element={<SavedPosts />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </LenisProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App