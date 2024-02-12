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

export const getMessages = async (token, chatId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/message/getMessages/${chatId}`, {
            headers: {
                JWT: token,
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const messages = await response.json();
        console.log(messages);
        return messages;
    } catch (error) {
        console.error('Error fetching chat details:', error.message);
        throw error;
    }
};

export const sendMessage = async (token, chatId, messageContent) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/message/createMessage/${chatId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                JWT: token,
            },
            body: JSON.stringify({
                content: messageContent,
                chatId: chatId,
            }),
        });

        if (!response.ok) {
            console.error('Network response was not ok');
            throw new Error('Network response was not ok');
        }

        return response.json();
    } catch (error) {
        console.error('Error sending message:', error.message);
        return false;
    }
};

export const getUserInfoById = async (token, userId) => {

    try {
        const response = await fetch(`${API_BASE_URL}/api/user/find/${userId}`, {
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

export const createGroup = async (token, chatName, participants) => {

    try {
        const response = await fetch('http://localhost:8080/api/chat/createGroup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                JWT: token,
            },
            body: JSON.stringify({
                participants: participants,
                chatName: chatName,
            }),
        });

        if (!response.ok) {
            console.error('Network response was not ok');
            throw new Error('Network response was not ok');
        }

        return true
    } catch (error) {
        console.error('Error creating group:', error.message);
        return false;
    }

}

export const chatInfo = async (token, chatId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/chatInfo/${chatId}`, {
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
}