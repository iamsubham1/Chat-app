import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import defaultUserImage from '../assets/user.png';
import { IoHomeSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { getUserInfo } from '@/apis/api';
import { getCookie } from '@/utility/getcookie';
import { MdEdit } from "react-icons/md";

Modal.setAppElement('#root'); // Set the root element for the modal

const ProfilePage = () => {
    const token = getCookie('JWT');
    const navigate = useNavigate();

    const fileInputRef = useRef(null);

    const [activeUserDetails, setActiveUserDetails] = useState('');
    const [loading, setloading] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        about: ''
    });

    const [isEditing, setIsEditing] = useState(false);

    const getActiveUserDetails = async () => {
        try {
            const activeUserData = await getUserInfo(token);
            setActiveUserDetails(activeUserData);
            return activeUserData;
        } catch (error) {
            console.error('Error fetching user info:', error.message);
        }
    };

    const handleUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files && event.target.files[0];

        try {
            setloading(true);
            console.log('File selected:', file);

            const formData = new FormData();
            formData.append('image', file);

            console.log('Sending file to server...');
            const response = await fetch('https://chat-app-vzjv.onrender.com/api/user/uploadImg', {
                method: 'POST',
                headers: {
                    'JWT': token,
                },
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error uploading file');
            }

            const data = await response.json();
            console.log('File uploaded successfully:', data);

            // window.location.reload();
        } catch (error) {
            console.error('Error:', error.message);
        } finally {
            setloading(false);
        }
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setEditData({
            ...editData,
            [name]: value,
        });
    };

    const openEditModal = () => {
        setEditData({
            name: activeUserDetails ? activeUserDetails.name : '',
            about: activeUserDetails ? activeUserDetails.about : ''
        });
        setIsEditing(true);
    };

    const closeEditModal = () => {
        setIsEditing(false);
    };

    const handleEdit = async (e) => {
        e.preventDefault();

        try {
            setloading(true);
            const response = await fetch(`https://chat-app-vzjv.onrender.com/api/user/edit/${activeUserDetails._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'JWT': token,
                },
                body: JSON.stringify(editData),
                credentials: 'include'
            });

            if (response.status === 200) {
                const data = await response.json();
                setActiveUserDetails(data);

                closeEditModal();
            } else {
                console.error("Unexpected status code:", response.status);
                alert("Something bad happened");
            }
        } catch (error) {
            console.error('Network error:', error);
        } finally {
            setloading(false);
        }
    };

    useEffect(() => {
        getActiveUserDetails();
    }, [loading]);

    if (loading) {
        return (
            <div className="w-full h-full bg-black flex items-center justify-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-[#121218] text-white p-4 md:p-8 h-[100vh] flex flex-col items-center justify-center">
                <button className="text-white text-3xl hover:text-[#9678FF] mb-6">
                    <IoHomeSharp onClick={() => navigate('/')} />
                </button>
                <div className="w-full max-w-[300px] md:max-w-[400px] ">
                    <div className="relative rounded-lg bg-black shadow-lg">
                        <div className="relative bg-[#3C1C63] rounded-t-lg py-8 flex items-center justify-center">
                            <img
                                src={activeUserDetails?.profilePic || defaultUserImage}
                                alt="Profile"
                                className="w-32 h-32 rounded-full border-4 border-white"
                                onClick={handleUpload}
                            />

                            <input
                                type="file"
                                id="picInput"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="p-6 text-center">
                            <p className="text-2xl font-semibold capitalize">{activeUserDetails?.name || "Unknown"}</p>
                            <p className="text-xl">{activeUserDetails?.phoneNumber || "xxxxx - xxxxx"}</p>
                            <p className="text-lg text-gray-400 mt-4">{activeUserDetails?.about || ""}</p>
                            <button
                                className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={openEditModal}
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isEditing}
                onRequestClose={closeEditModal}
                className="modal"
                overlayClassName="overlay"
            >
                <div className="w-full max-w-[95%] md:max-w-[50%] lg:max-w-[35%] mx-auto p-6 bg-[#222] text-white rounded-lg">
                    <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>
                    <form className="editForm" onSubmit={handleEdit}>
                        <label className="block mb-4">
                            Name:
                            <input
                                className="w-full bg-[#000] text-white p-3 rounded mt-1"
                                type="text"
                                name="name"
                                value={editData.name}
                                onChange={handleInput}
                            />
                        </label>

                        <label className="block mb-4">
                            About:
                            <textarea
                                className="w-full bg-[#000] text-white p-3 rounded mt-1"
                                name="about"
                                value={editData.about}
                                onChange={handleInput}
                            />
                        </label>

                        <div className="mt-6 flex justify-between">
                            <button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto mr-2"
                                type="submit"
                            >
                                Save Changes
                            </button>
                            <button
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
                                onClick={closeEditModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
};

export default ProfilePage;
