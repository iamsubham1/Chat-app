// Function to format timestamp
export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date(); // Current date

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === new Date(today - 86400000).toDateString(); // 86400000 milliseconds in a day

    if (isToday) {
        return `Today ${date.toLocaleTimeString()}`;
    } else if (isYesterday) {
        return "yesterday";
    } else {
        return `${date.toLocaleDateString()}`;
    }
};
