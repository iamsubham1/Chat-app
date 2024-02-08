import React from 'react'
import Modal from 'react-modal';


const EditGroupModal = ({ isOpen, closeModal, selectedChatId }) => {
    return (

        <Modal
            isOpen={isOpen}
            onRequestClose={() => {

                closeModal();


            }} className='modal-content w-full h-full flex-col highest grid place-content-center font '
            overlayClassName="overlay"
        >



            <div className='bg-red-400 w-full h-full flex-col flexprop'>
                <h1 className='text-center py-2'>edit group</h1>
                <div className='main-sec w-[50vw] h-[50vh] bg bg-zinc-200'>

                </div>
















                <button onClick={() => {
                    closeModal();

                }} className='bg bg-red-600 absolute right-10 top-10'>Close</button>
            </div>

        </Modal>
    )
}

export default EditGroupModal
