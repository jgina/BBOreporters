import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CategoriesProvider } from './context/CategoriesContext';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import AnalyticsTracker from './components/AnalyticsTracker';
import CookieConsentBanner from './components/CookieConsentBanner';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import AuthorsPage from './pages/AuthorsPage';
import AuthorProfilePage from './pages/AuthorProfilePage';
import CategoryPage from './pages/CategoryPage';
import PostPage from './pages/PostPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SearchPage from './pages/SearchPage';

// Admin
import AdminLoginPage from './admin/AdminLoginPage';
import AdminDashboardPage from './admin/AdminDashboardPage';
import AdminAuthorsPage from './admin/AdminAuthorsPage';
import AdminPostEditorPage from './admin/AdminPostEditorPage';
import AdminCategoryPage from './admin/AdminCategoryPage';

function App() {
  return (
    <HelmetProvider>
      <CategoriesProvider>
        <div className="app-shell">
          <AnalyticsTracker />
          <CookieConsentBanner />
          <Header />
          <main>
            <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/authors" element={<AuthorsPage />} />
                <Route path="/authors/:slug" element={<AuthorProfilePage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/post/:slug" element={<PostPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/search" element={<SearchPage />} />
                
                {/* Admin Auth */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                
                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/posts/new"
                  element={
                    <ProtectedRoute>
                      <AdminPostEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/posts/:id/edit"
                  element={
                    <ProtectedRoute>
                      <AdminPostEditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute>
                      <AdminCategoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/authors"
                  element={
                    <ProtectedRoute>
                      <AdminAuthorsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </CategoriesProvider>
    </HelmetProvider>
  );
}

export default App;