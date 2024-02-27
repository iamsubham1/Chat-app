import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    verifyOtp
} from '../apis/api';

import PasswordChange from './PasswordChange';
const VerifyOTP = (email) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState('');
    const [otpVerified, setotpVerified] = useState(false);

    const [loading, setloading] = useState(false);

    console.log(email);
    const handleChange = (e) => {
        setFormData(e.target.value);
        console.log(formData)
    };

    const handleSubmit = async (e) => {

        try {
            setloading(true);
            e.preventDefault();
            const checkOtp = await verifyOtp(formData);
            if (checkOtp) {
                setotpVerified(true);
                alert("otp verified");
            } else {
                alert("something is wrong")
            }

        } catch (error) {
            console.error('Network error:', error);
        } finally {
            setloading(false);
        }

    }

    if (loading) {
        return (<div className="spinner-border" role="status" id='spinner'>
            <span className="visually-hidden">Loading...</span>
        </div>)
    }


    return (
        <>
            {otpVerified ? <PasswordChange email={email} /> : <div className="h-screen flex  font-semibold font-poppins signup blackBg">
                <div className='w-full h-[90%] grid place-items-center'>
                    <div className="bg-[#0000005d] p-8 rounded shadow-md w-full sm:w-96 z-10 ">
                        <h2 className="text-4xl font-semibold mb-4 text-[rgba(125,74,180,1)]">Verify OTP</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    id="receivedOtp"
                                    name="receivedOtp"
                                    value={formData.receivedOtp}
                                    onChange={handleChange}
                                    placeholder="Enter OTP"
                                    className="mt-1 p-2 w-full rounded-md border-2 focus:outline-none focus:border-blue-500 bg-transparent text-white focus:bg-transparent"
                                />
                            </div>


                            <div className="">
                                <button type="submit" className='bg-[#0f0f0fc4] text-white px-6 py-2 rounded hover:bg-[white] hover:text-black transition duration-300 font-semibold border-2'
                                >
                                    Verify
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
            }</>
    )
}

export default VerifyOTP
