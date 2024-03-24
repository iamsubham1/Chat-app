import React, { useState } from 'react';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaRegEye, FaEyeSlash } from 'react-icons/fa';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"

const LoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast()
  const [userData, setUserData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  }


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
      const response = await fetch('https://chat-app-vzjv.onrender.com/api/auth/login', {
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
        cookies.set('JWT', data.JWT, { httpOnly: false, secure: true, sameSite: 'none', maxAge: 60 * 60 * 24 })

        toast({

          title: "login successfull",

        })

        setTimeout(() => {
          navigate('/');
        }, 1000);

      }

      else if (response.status === 400) {


        alert('Incorrect credentials');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
    setUserData: []
  };

  return (
    <div className="min-h-screen min-w-screen z-2 loginPage blackBg font-semibold">
      <header className="w-screen h-[8vh] bg-[#121218] flex justify-between items-center text-[white] z-10">
        <h1 className='ml-5 customText text-2xl font-bold font-sans'>.CONNECT</h1>

      </header>
      <div className='z-10  loginformContainer '>
        <div className="bg-[#0000005d] p-8 rounded shadow-md w-[23vw] h-[55%]  z-10 ">
          <h2 className="text-4xl font-semibold mb-7  text-white text-center">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-7">
            <div>

              <input
                type="email"
                name='email'
                id="email"

                value={userData.email}
                onChange={handleInput}
                required
                placeholder="Name"
                className="mt-1 p-2 w-full rounded-md border-2 focus:outline-8 focus:border-blue-500 bg-transparent text-white focus:bg-transparent"
              />
            </div>
            <div className='mb-4 relative'>

              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={userData.password}
                onChange={handleInput}
                required
                placeholder="Password"
                className="mt-1 p-2 w-full rounded-md border-2 focus:outline-8 focus:border-blue-500 bg-transparent text-white focus:bg-transparent"
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
              className="bg-[#0f0f0fc4] text-white px-6 py-2 rounded hover:bg-[white] hover:text-black transition duration-300 font-semibold border-2"
            >
              Login
            </button>
          </form>
          <h6 className='text-white my-5'><Link to='/resetpassword' className='text-[rgba(125,74,180,1)] hover:text-white'>
            Forget Password ?</Link></h6>
          <h6 className='text-white my-5'>Dont have an account ? <Link to='/signup' className='text-[rgba(125,74,180,1)] hover:text-white'>
            Create</Link></h6>
        </div>

      </div>
      <Toaster />
    </div>
  );
};

export default LoginForm;
