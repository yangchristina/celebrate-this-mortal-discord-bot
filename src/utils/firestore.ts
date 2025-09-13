import { db } from '../index';

interface Birthday {
  userId: string;
  birthday: string; // MM-DD format
  serverTimezone?: string;
}

/**
 * Get a user's birthday from Firestore
 */
export async function getBirthday(userId: string): Promise<string | null> {
  try {
    const docRef = db.collection('birthdays').doc(userId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      return data?.birthday || null;
    }

    return null;
  } catch (error) {
    console.error('Error getting birthday:', error);
    throw new Error('Failed to retrieve birthday from database');
  }
}

/**
 * Set a user's birthday in Firestore
 */
export async function setBirthday(userId: string, birthday: string): Promise<void> {
  try {
    const docRef = db.collection('birthdays').doc(userId);
    await docRef.set({
      userId,
      birthday,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error setting birthday:', error);
    throw new Error('Failed to save birthday to database');
  }
}

/**
 * Get birthdays that are coming up in the specified number of days
 */
export async function getUpcomingBirthdays(daysAhead: number = 14): Promise<Birthday[]> {
  try {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysAhead);

    // Format as MM-DD to match against stored birthdays
    const targetMonthDay = formatMonthDay(targetDate);

    const birthdaysRef = db.collection('birthdays');
    const snapshot = await birthdaysRef.get();

    const upcomingBirthdays: Birthday[] = [];

    snapshot.forEach((docSnap: any) => {
      const data = docSnap.data();
      if (data.birthday) {
        // Birthday is already in MM-DD format, compare directly
        if (data.birthday === targetMonthDay) {
          upcomingBirthdays.push({
            userId: data.userId,
            birthday: data.birthday,
            serverTimezone: data.serverTimezone
          });
        }
      }
    });

    return upcomingBirthdays;
  } catch (error) {
    console.error('Error getting upcoming birthdays:', error);
    throw new Error('Failed to retrieve upcoming birthdays from database');
  }
}

/**
 * Get all birthdays for a specific date (used for birthday reveals)
 */
export async function getBirthdaysForDate(date: Date): Promise<Birthday[]> {
  try {
    const monthDay = formatMonthDay(date);

    const birthdaysRef = db.collection('birthdays');
    const snapshot = await birthdaysRef.get();

    const todaysBirthdays: Birthday[] = [];

    snapshot.forEach((docSnap: any) => {
      const data = docSnap.data();
      if (data.birthday) {
        // Birthday is already in MM-DD format, compare directly
        if (data.birthday === monthDay) {
          todaysBirthdays.push({
            userId: data.userId,
            birthday: data.birthday,
            serverTimezone: data.serverTimezone
          });
        }
      }
    });

    return todaysBirthdays;
  } catch (error) {
    console.error('Error getting birthdays for date:', error);
    throw new Error('Failed to retrieve birthdays for date from database');
  }
}

/**
 * Validate a birthday date string (MM-DD format)
 */
export function isValidBirthday(dateString: string): boolean {
  console.log(`Validating date: "${dateString}"`);

  // Check if the input is a string
  if (typeof dateString !== 'string') {
    console.log(`Date is not a string: ${typeof dateString}`);
    return false;
  }

  // Check regex pattern for MM-DD format
  const regex = /^\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    console.log(`Date doesn't match MM-DD regex pattern: ${dateString}`);
    return false;
  }

  // Parse the month and day
  const [month, day] = dateString.split('-').map(Number);

  // Validate month (1-12)
  if (month < 1 || month > 12) {
    console.log(`Invalid month: ${month}`);
    return false;
  }

  // Validate day (1-31, with month-specific validation)
  if (day < 1 || day > 31) {
    console.log(`Invalid day: ${day}`);
    return false;
  }

  // Check for month-specific day limits
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Using 29 for Feb to allow leap year dates
  if (day > daysInMonth[month - 1]) {
    console.log(`Day ${day} is invalid for month ${month}`);
    return false;
  }

  console.log(`Date validation successful: ${dateString}`);
  return true;
}

/**
 * Format a date as MM-DD string
 */
function formatMonthDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}
