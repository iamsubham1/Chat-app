import React, { useState } from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    email: '',
    password: '',
  });


  const handleInput = (e) => {
    const { name, value } = e.target
    setUserData({
      ...userData,
      [name]: value,
    })

  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const cookies = new Cookies();
        cookies.set('JWT', data.JWT, { httpOnly: false, secure: true, sameSite: 'none' })
        console.log('Login successful:', data.JWT);
        alert("login successfull")
        navigate('/');
      }

      else if (response.status === 400) {


        alert('Incorrect credentials');
      }
    } catch (error) {
      console.error('Network error:', error);
    }



    console.log('Email:', userData.email);
    console.log('Password:', userData.password);
    setUserData: []
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg" style={{ backgroundColor: '#030712' }}>
      <div className="bg-slate-400 p-8 rounded shadow-md w-[25vw] min-h-[55vh]">
        <h2 className="text-4xl font-semibold mb-7 underline">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email:
            </label>
            <input
              type="email"
              name='email'
              id="email"

              value={userData.email}
              onChange={handleInput}
              required
              className="mt-1 p-2 border rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={userData.password}
              onChange={handleInput}
              required
              className="mt-1 p-2 border rounded w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
