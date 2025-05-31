import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name ist erforderlich';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'E-Mail-Format ist ungültig';
    }
    
    if (!formData.password) {
      errors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 6) {
      errors.password = 'Passwort muss mindestens 6 Zeichen haben';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwörter stimmen nicht überein';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password
    };
    
    const success = await register(userData);
    if (success) {
      navigate('/login', { state: { registered: true } });
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Neuen Account erstellen
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Oder{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              melden Sie sich mit Ihrem bestehenden Account an
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className={`mt-1 block w-full rounded-md py-1.5 px-3 ${
                  formErrors.name ? 'border-red-300 ring-red-300' : 'border-gray-300 ring-gray-300'
                } focus:ring-blue-600 focus:border-blue-600 sm:text-sm`}
                value={formData.name}
                onChange={handleChange}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`mt-1 block w-full rounded-md py-1.5 px-3 ${
                  formErrors.email ? 'border-red-300 ring-red-300' : 'border-gray-300 ring-gray-300'
                } focus:ring-blue-600 focus:border-blue-600 sm:text-sm`}
                value={formData.email}
                onChange={handleChange}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`mt-1 block w-full rounded-md py-1.5 px-3 ${
                  formErrors.password ? 'border-red-300 ring-red-300' : 'border-gray-300 ring-gray-300'
                } focus:ring-blue-600 focus:border-blue-600 sm:text-sm`}
                value={formData.password}
                onChange={handleChange}
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`mt-1 block w-full rounded-md py-1.5 px-3 ${
                  formErrors.confirmPassword ? 'border-red-300 ring-red-300' : 'border-gray-300 ring-gray-300'
                } focus:ring-blue-600 focus:border-blue-600 sm:text-sm`}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 py-2 px-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-300"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Lädt...
                </span>
              ) : (
                'Registrieren'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;