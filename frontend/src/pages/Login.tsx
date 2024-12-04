import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  login: (credentials: LoginCredentials) => Promise<void>;
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth() as AuthContextType;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError('');
      setIsLoading(true);
      await login({ username, password });
      navigate('/documents');
    } catch (err) {
      setError('Invalid username/email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#002b36]">
      <div className="w-[400px] mx-auto bg-[#073642] rounded-xl p-8" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <div className="text-center mb-8">
          <h2 className="text-[#93a1a1] text-3xl font-bold mb-2">Document Control</h2>
          <p className="text-[#93a1a1]">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-[#dc322f] bg-opacity-10 border border-[#dc322f] rounded-md p-4">
              <p className="text-[#dc322f] text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-[#93a1a1] text-sm font-medium mb-1">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full px-3 py-2 bg-white text-gray-900 border border-[#586e75] rounded-md focus:outline-none focus:ring-2 focus:ring-[#268bd2] focus:border-transparent"
                style={{ backgroundColor: 'white' }}
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[#93a1a1] text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 bg-white text-gray-900 border border-[#586e75] rounded-md focus:outline-none focus:ring-2 focus:ring-[#268bd2] focus:border-transparent"
                style={{ backgroundColor: 'white' }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 bg-[#268bd2] text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#268bd2] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
