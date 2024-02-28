import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PasswordChange = (email) => {


    const navigate = useNavigate();
    const [formData, setFormData] = useState('');
    const [loading, setloading] = useState(false);

    console.log("propemailis :", email)
    const handleChange = (e) => {
        setFormData(e.target.value);
        console.log(formData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setloading(true);
            const response = await fetch("http://localhost:8080/api/auth/changePassword", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',

                },
                body: JSON.stringify({
                    password: formData,
                    email: email.email.email,

                }),
            })
            if (response.ok) {
                alert("password changed sucessfully");
                navigate('/login');

            }
            else {
                alert("something wrong happened");
                console.log(response);

                navigate('/resetpassword')
            }
        } catch (error) {
            console.error('Network error:', error);
        } finally {
            setloading(false);
        }


    }
    if (loading) {
        return (
            <div className="w-[100vw] h-[100vh] bg-black"><div className="spinner-border" role="status" id='spinner'>
                <span className="visually-hidden">Loading...</span>
            </div></div>)
    }

    return (
        <div className="h-screen flex  font-semibold font-poppins signup blackBg">
            <div className='w-full h-[90%] grid place-items-center'>
                <div className="bg-[#0000005d] p-8 rounded shadow-md w-full sm:w-96 z-10 ">
                    <h2 className="text-4xl font-semibold mb-4 text-[rgba(125,74,180,1)]">New Password</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                type="text"
                                id="receivedOtp"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter New Password"
                                className="mt-1 p-2 w-full rounded-md border-2 focus:outline-none focus:border-blue-500 bg-transparent text-white focus:bg-transparent"
                            />

                        </div>


                        <div className="">
                            <button type="submit" className='bg-[#0f0f0fc4] text-white px-6 py-2 rounded hover:bg-[white] hover:text-black transition duration-300 font-semibold border-2'
                            >
                                Change Password
                            </button>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default PasswordChange
