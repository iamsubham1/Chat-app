



const generateUniqueOTP = (length = 6) => {
    const chars = '0123456789'; // Define the character set for OTP
    let otp = '';

    // Generate random OTP (5 digits)
    for (let i = 0; i < length - 1; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        otp += chars[randomIndex];
    }

    // Append single digit from timestamp to ensure 6 digits
    const timestamp = Date.now();
    otp += timestamp.toString().slice(-1); // Append the last digit of the timestamp

    return otp;
}

module.exports = {
    generateUniqueOTP
};



