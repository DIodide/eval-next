/**
 * Time formatting utilities with timezone conversion support
 * 
 * This utility handles the conversion of UTC timestamps stored in the database
 * to the user's local timezone for display purposes.
 */

/**
 * Format a date in a human-readable format
 */
export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

/**
 * Format a short date (no weekday)
 */
export const formatShortDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

/**
 * Enhanced time formatting with timezone conversion
 * 
 * Combines a UTC date with time strings to create a proper datetime,
 * then converts it to the user's local timezone for display.
 * 
 * @param utcDate - The UTC date from the database
 * @param timeStart - Start time string (e.g., "14:30")
 * @param timeEnd - End time string (e.g., "16:00")
 * @param options - Formatting options
 */
export const formatDateTimeInLocalTimezone = (
  utcDate: Date, 
  timeStart?: string | null, 
  timeEnd?: string | null,
  options: {
    showDate?: boolean;
    showTime?: boolean;
    showTimezone?: boolean;
  } = { showDate: true, showTime: true, showTimezone: true }
) => {
  if (!timeStart) {
    if (options.showDate && options.showTime) {
      return `${formatDate(utcDate)} • Time TBA`
    }
    return options.showDate ? formatDate(utcDate) : "Time TBA"
  }

  // Create a Date object by combining the UTC date with the time
  // We assume the time is stored in UTC and needs to be converted to local
  const timeParts = timeStart.split(':')
  const startHours = parseInt(timeParts[0] ?? '0', 10)
  const startMinutes = parseInt(timeParts[1] ?? '0', 10)
  
  // Create UTC datetime by combining date and time
  const utcDateTime = new Date(utcDate)
  utcDateTime.setUTCHours(startHours, startMinutes, 0, 0)
  
  const formatOptions: Intl.DateTimeFormatOptions = {}
  
  if (options.showDate) {
    formatOptions.weekday = 'long'
    formatOptions.year = 'numeric'
    formatOptions.month = 'long'
    formatOptions.day = 'numeric'
  }
  
  if (options.showTime) {
    formatOptions.hour = '2-digit'
    formatOptions.minute = '2-digit'
    if (options.showTimezone) {
      formatOptions.timeZoneName = 'short'
    }
  }

  const localStart = new Intl.DateTimeFormat('en-US', formatOptions).format(utcDateTime)

  // Handle end time if provided
  if (timeEnd) {
    const endTimeParts = timeEnd.split(':')
    const endHours = parseInt(endTimeParts[0] ?? '0', 10)
    const endMinutes = parseInt(endTimeParts[1] ?? '0', 10)
    const utcEndDateTime = new Date(utcDate)
    utcEndDateTime.setUTCHours(endHours, endMinutes, 0, 0)
    
    const localEnd = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      ...(options.showTimezone ? { timeZoneName: 'short' } : {})
    }).format(utcEndDateTime)

    if (options.showDate) {
      return `${localStart} - ${localEnd.split(' ').slice(-2).join(' ')}`
    } else {
      return `${localStart} - ${localEnd}`
    }
  }

  return localStart
}

/**
 * Legacy function for backward compatibility
 * Only use this for simple time string display where timezone conversion is not needed
 */
export const formatTime = (timeStart?: string, timeEnd?: string) => {
  if (!timeStart) return "Time TBA"
  if (!timeEnd) return timeStart
  return `${timeStart} - ${timeEnd}`
}

/**
 * Check if a date is in the past
 */
export const isPastDate = (date: Date) => {
  return new Date(date) < new Date()
}

/**
 * Check if a date is upcoming (in the future)
 */
export const isUpcomingDate = (date: Date) => {
  return new Date(date) > new Date()
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return diffInMinutes < 1 ? "Just now" : `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`
    } else {
      const diffInWeeks = Math.floor(diffInDays / 7)
      return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`
    }
  }
} 