/**
 * Utility functions for timezone conversion
 * Philippine Time is UTC+8
 */

/**
 * Convert UTC time to Philippine Time (UTC+8)
 * Philippine Time is 8 hours ahead of UTC
 * @param utcDate - Date in UTC or ISO string
 * @returns Date object in Philippine Time
 */
export function convertToPhilippineTime(utcDate: Date | string): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  
  // Add 8 hours for Philippine Time (UTC+8)
  const philippineTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  
  return philippineTime;
}

/**
 * Convert UTC time to Philippine Time and return as ISO string
 * @param utcDate - Date in UTC or ISO string
 * @returns ISO string in Philippine Time
 */
export function convertToPhilippineTimeISO(utcDate: Date | string): string {
  return convertToPhilippineTime(utcDate).toISOString();
}

/**
 * Format Philippine time for logging
 * @param utcDate - Date in UTC or ISO string
 * @returns Formatted string showing both UTC and Philippine time
 */
export function formatPhilippineTimeLog(utcDate: Date | string): string {
  const originalDate = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  const philippineTime = convertToPhilippineTime(utcDate);
  
  return `UTC: ${originalDate.toISOString()} → PH Time: ${philippineTime.toISOString()}`;
}