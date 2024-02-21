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
    const [isuploading, setIsuploading] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        about: ''

    });

    const [isEditing, setIsEditing] = useState(false);


    const handleUpload = () => {
        fileInputRef.current.click();
    }


    const handleFileChange = async (event) => {
        const file = event.target.files && event.target.files[0];

        try {
            setIsuploading(true);
            console.log('File selected:', file);

            const formData = new FormData();
            formData.append('image', file);

            console.log('Sending file to server...');
            const response = await fetch('http://localhost:8080/api/user/uploadImg', {
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

            console.log('File upload successful. Retrieving response data...');
            const data = await response.json();
            console.log('File uploaded successfully:', data);

            console.log('Updating profile picture key...');


            // window.location.reload();
        } catch (error) {
            console.error('Error:', error.message);
        } finally {
            console.log('File upload process completed.');
            setIsuploading(false);
        }
    };


    const handleInput = (e) => {
        const { name, value } = e.target
        setEditData({
            ...editData,
            [name]: value,
        })

    }

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


    const handleEdit = async () => {
        console.log("user id is : ", activeUserDetails._id)
        try {
            const response = await fetch(`http://localhost:8080/api/user/edit/${activeUserDetails._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'JWT': token
                },
                body: JSON.stringify(editData),
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.JSON()
                setActiveUserDetails(data)


            }
            alert("something is bad happened")

        } catch (error) {
            console.error('Network error:', error);

        }
    }

    const handleSaveChanges = async () => {

        handleEdit();
        closeEditModal();
        window.location.reload()
    };

    const getActiveUserDetails = async () => {
        try {
            const activeUserData = await getUserInfo(token);
            setActiveUserDetails(activeUserData);
            return activeUserData;
        } catch (error) {
            console.error('Error fetching user info:', error.message);
        }
    };


    useEffect(() => {

        getActiveUserDetails()

    }, [isuploading]);

    return (
        <>
            <div className="bg-[#121218] blackBg text-white p-8 h-[100VH] flex-col">
                <button className='homeBtn text-white text-3xl hover:text-[#9678FF]'><IoHomeSharp onClick={() => {
                    navigate('/')
                }} />
                </button>
                <div id="algn">
                    <div id="card">
                        <div id="upper-bg" className='bg-red-600'>
                            <img src={activeUserDetails && activeUserDetails.profilePic ? activeUserDetails.profilePic : defaultUserImage}
                                alt="" className="profile-pic" />
                            <form encType="multipart/form-data" method='post' >


                                <input
                                    type='file'
                                    id='picInput'
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                            </form>
                            <MdEdit className='hover:text-white hover:cursor-pointer text-[#4d4d4d] absolute bottom-1 right-[30%]' onClick={handleUpload} />
                        </div>
                        <div id="lower-bg">
                            <div className="text text-2xl">
                                <p className="name capitalize">{activeUserDetails ? activeUserDetails.name : "unknown"}</p>
                                <p className="PhoneNumber text-xl">{activeUserDetails ? activeUserDetails.phoneNumber : "xxxxx - xxxxx"}</p>
                            </div>
                            <div id="icons">
                                <h2 className='text-center text-[#A47FCC]'>{activeUserDetails ? activeUserDetails.about : ""}</h2>
                            </div>
                            <div id="btn">
                                <button className="msg text-black" onClick={openEditModal}>Edit</button>

                            </div>


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
                <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
                <form className='editForm' onSubmit={handleSaveChanges} >
                    <label className="block mb-2 py-2">
                        Name:
                        <input
                            className="w-full bg-[#000000] text-white  p-2 rounded customBorder"
                            type="text"
                            name='name'
                            value={editData.name}
                            onChange={handleInput}
                        />
                    </label>


                    <label className="block mb-2 py-2">
                        About:
                        <textarea
                            className="w-full bg-[#000000] text-white  p-2 rounded customBorder"
                            name='about'
                            value={editData.about}
                            onChange={handleInput}
                        />
                    </label>
                    <div className="mt-4">
                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                            type='submit'

                        >
                            Save Changes
                        </button>
                        <button
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"

                            onClick={closeEditModal}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </>

    );
};

export default ProfilePage;
