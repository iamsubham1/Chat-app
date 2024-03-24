import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaRegEye, FaEyeSlash } from 'react-icons/fa';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"

const Signup = () => {
    const { toast } = useToast()

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        number: '',
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false)

    const handleTogglePassword = () => {
        setShowPassword(!showPassword)
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://chat-app-vzjv.onrender.com/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                toast({
                    title: "Account Created Successfully",

                })

                setTimeout(() => {
                    navigate('/login');
                }, 1200);

            } else {
                alert('Something bad happened');
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };

    return (
        <div className="h-screen flex  font-semibold font-poppins signup blackBg">
            <header className="w-screen h-[8vh] bg-[#121218] flex justify-between items-center text-[white] z-10">
                <h1 className='ml-5 customText text-2xl font-bold font-sans'>.CONNECT</h1>

            </header>
            <div className='w-full h-[90%] grid place-items-center'>
                <div className="bg-[#0000005d] p-8 rounded shadow-md w-full sm:w-96 z-10 ">
                    <h2 className="text-4xl font-semibold mb-4 text-white text-center">Create an account</h2>

                    <form onSubmit={handleSubmit}>


                        <div className="mb-4">

                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Name"
                                className="mt-1 p-2 w-full border rounded-md border-2 focus:outline-8 focus:border-blue-500 bg-transparent text-white focus:bg-transparent"
                            />
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                id="phoneNumber"
                                name="number"
                                value={formData.number}
                                onChange={handleChange}
                                placeholder="Phone number"
                                className="mt-1 p-2 w-full border rounded-md border-2 focus:outline-none focus:border-blue-500 bg-transparent text-white focus:bg-transparent"
                            />
                        </div>

                        <div className="mb-4">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="mt-1 p-2 w-full border rounded-md border-2 focus:outline-none focus:border-blue-500 bg-transparent text-white focus:bg-transparent"
                            />
                        </div>

                        <div className="mb-4 relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:border-blue-500 bg-transparent text-white focus:bg-transparent pr-10" // Added pr-10 for padding-right to make space for the eye icon
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

                        <div className="">
                            <button type="submit" className='bg-[#0f0f0fc4] text-white px-6 py-2 rounded hover:bg-[white] hover:text-black transition duration-300 font-semibold border-2'>
                                Sign Up
                            </button>
                            <h6 className='text-white my-5'>Have an account ? <Link to='/login' className='text-[rgba(125,74,180,1)] hover:text-white'>
                                Login</Link></h6>
                        </div>
                    </form>
                </div>
            </div>
            <Toaster />
        </div>

    );
};

export default Signup;
