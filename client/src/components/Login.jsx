import React, { useState } from 'react';
import Cookies from 'universal-cookie';
import { useNavigate, Link } from 'react-router-dom';
import { FaRegEye, FaEyeSlash } from 'react-icons/fa';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

const LoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

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
        cookies.set('JWT', data.JWT, { httpOnly: false, secure: true, sameSite: 'none', maxAge: 60 * 60 * 24 });

        toast({
          title: "Login successful",
        });

        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else if (response.status === 400) {
        alert('Incorrect credentials');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center font-poppins relative overlay">
      <header className="w-full h-[8vh] bg-[#121218] flex justify-between items-center text-white px-4 z-10 ">
        <h1 className='customText text-2xl font-bold  font-sans'>.CONNECT</h1>
      </header>

      <div className='p-4 w-full max-w-[500px] m-auto'>
        <div className="bg-[#0000005d] p-8 rounded shadow-md w-full m-auto relative z-10">
          <h2 className="text-4xl font-semibold mb-7 text-white text-center">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className='flex flex-1'>
              <input
                type="email"
                name="email"
                id="email"
                value={userData.email}
                onChange={handleInput}
                required
                placeholder="Email"
                className="p-2 w-full rounded-md border-2 focus:outline-none focus:border-blue-500 bg-transparent text-white"
              />
            </div>
            <div className='relative'>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={userData.password}
                onChange={handleInput}
                required
                placeholder="Password"
                className="p-2 w-full rounded-md border-2 focus:outline-none focus:border-blue-500 bg-transparent text-white"
              />
              {showPassword ? (
                <FaRegEye
                  className='text-white cursor-pointer text-lg absolute top-1/2 right-3 transform -translate-y-1/2'
                  onClick={handleTogglePassword}
                />
              ) : (
                <FaEyeSlash
                  className='text-white cursor-pointer text-lg absolute top-1/2 right-3 transform -translate-y-1/2'
                  onClick={handleTogglePassword}
                />
              )}
            </div>

            <button
              type="submit"
              className="bg-[#0f0f0fc4] w-full text-white px-6 py-2 rounded hover:bg-white hover:text-black transition duration-300 font-semibold border-2"
            >
              Login
            </button>
          </form>
          <h6 className='text-white my-5'>
            <Link to='/resetpassword' className='text-[rgba(125,74,180,1)] hover:text-white'>
              Forget Password?
            </Link>
          </h6>
          <h6 className='text-white my-5'>
            Don't have an account? <Link to='/signup' className='text-[rgba(125,74,180,1)] hover:text-white'>
              Create
            </Link>
          </h6>
        </div>
      </div>

      <Toaster />

      <style jsx>{`
        .overlay {
          background-image: url(../src/assets/bg.jpg);
          background-size: cover; /* Changed to cover to fill the container */
          position: relative; /* Ensure positioning is relative */
        }

        .overlay::before {
          content: "";
          z-index: 1; /* Ensure it’s behind the content */
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background-color: rgba(0, 0, 0, 0.555);
          backdrop-filter: blur(4px); /* Adjust the blur as needed */
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
