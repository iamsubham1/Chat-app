// Function to format timestamp without seconds
export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date(); // Current date

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === new Date(today - 86400000).toDateString(); // 86400000 milliseconds in a day

    const timeOptions = {
        hour: 'numeric',
        minute: 'numeric'
        // you can add more options if needed, such as timeZone, hour12, etc.
    };

    if (isToday) {
        return `${date.toLocaleTimeString(undefined, timeOptions)}`;
    } else if (isYesterday) {
        return "yesterday";
    } else {
        return `${date.toLocaleDateString()}`;
    }
};
