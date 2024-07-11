/**
 * Get a relative time string (e.g., "1 minute ago", "1 hr ago", "1 day ago", "1 year ago").
 * 
 * @param {string | number | Date} createTimeDate - The creation time in a format that can be parsed by the Date constructor.
 * @returns {string} - A string representing the relative time since the creation date.
 */
export const getRelativeTime = (createTimeDate) => {
    const now = new Date(); // Get the current date and time
    const createdAtDate = new Date(createTimeDate); // Parse the input date
    const diffInSeconds = Math.floor((now - createdAtDate) / 1000); // Calculate the difference in seconds

    // Define time intervals in seconds for various units
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ];

    // Iterate through the intervals to find the appropriate label and count
    for (let i = 0; i < intervals.length; i++) {
        const interval = intervals[i];
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count > 0) {
            // Return the relative time string
            return count === 1 ? `1 ${interval.label} ago` : `${count} ${interval.label}s ago`;
        }
    }

    return 'just now'; 
};

/**
 * Format a date string into a more readable format (e.g., "July 11, 2024, 04:30 PM").
 * 
 * @param {string | number | Date} dateString - The date string to format.
 * @returns {string} - A formatted date string.
 */
export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('en-IN', options).format(new Date(dateString));
};
