import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    sentotp
} from '../apis/api';
import VerifyOTP from './VerifyOTP';




const ResetPasswordPage = () => {
    const navigate = useNavigate();

    const [OTPsent, setOTPsent] = useState();
    const [formData, setFormData] = useState('');
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        console.log(formData)
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/auth/verifyEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            if (response.ok) {

                const isotpsent = await sentotp(JSON.stringify(formData));
                setOTPsent(true);
                if (isotpsent) {
                    alert('otp sent');

                } else {

                    alert('unable to send otp');

                }

            } else {
                alert('Email not found');
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };

    return (
        <>
            {OTPsent ? <VerifyOTP email={formData} /> : <div className="h-screen flex  font-semibold font-poppins signup blackBg">

                <div className='w-full h-[90%] grid place-items-center'>
                    <div className="bg-[#0000005d] p-8 rounded shadow-md w-full sm:w-96 z-10 ">
                        <h2 className="text-4xl font-semibold mb-4 text-[rgba(125,74,180,1)]">Reset Password</h2>

                        <form onSubmit={handleSubmit}>




                            <div className="mb-4">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="mt-1 p-2 w-full rounded-md border-2 focus:outline-none focus:border-blue-500 bg-transparent text-white focus:bg-transparent"
                                />
                            </div>


                            <div className="">
                                <button type="submit" className='bg-[#0f0f0fc4] text-white px-6 py-2 rounded hover:bg-[white] hover:text-black transition duration-300 font-semibold border-2'>
                                    Verify Email
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            </div>}

        </>
    )
}

export default ResetPasswordPage
