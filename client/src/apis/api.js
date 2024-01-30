// api.js
const API_BASE_URL = 'http://localhost:8080';

export const getAllChats = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/allChats`, {
            headers: {
                JWT: token,
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching all chats:', error.message);
        throw error;
    }
};

export const searchUsers = async (token, keyword) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/search?search=${keyword}`, {
            headers: {
                JWT: token,
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching search results:', error.message);
        throw error;
    }
};

export const getUserInfo = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
            headers: {
                JWT: token,
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching user info:', error.message);
        throw error;
    }
};

export const getChatDetails = async (token, chatId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/message/getMessages/${chatId}`, {
            headers: {
                JWT: token,
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching chat details:', error.message);
        throw error;
    }
};

export const createChatWithUser = async (token, userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                JWT: token,
            },
            body: JSON.stringify({
                userId,
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data && data._id) {
            return data._id;
        } else {
            console.error('Invalid response from the server:', data);
            return null;
        }
    } catch (error) {
        console.error('Error creating chat:', error.message);
        throw error;
    }
};


export const sendMessage = async (token, payload) => {
    const response = await fetch(`${baseUrl}/api/message/createMessage/${payload.chatId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            JWT: token,
        },
        body: JSON.stringify({
            content: payload.content,
            chatId: payload.chatId,
        }),
    });

    if (!response.ok) {
        console.error('Network response was not ok');
        throw new Error('Network response was not ok');
    }

    socket.emit('message', { content: payload.content, chatId: payload.chatId });

    return response.json();
};





