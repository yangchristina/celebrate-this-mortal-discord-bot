import { db } from '../index';

interface Birthday {
  userId: string;
  birthday: string; // YYYY-MM-DD format
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
        const birthdayMonthDay = data.birthday.substring(5); // Extract MM-DD from YYYY-MM-DD
        if (birthdayMonthDay === targetMonthDay) {
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
        const birthdayMonthDay = data.birthday.substring(5); // Extract MM-DD from YYYY-MM-DD
        if (birthdayMonthDay === monthDay) {
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
 * Validate a birthday date string (YYYY-MM-DD format)
 */
export function isValidBirthday(dateString: string): boolean {
  console.log(`Validating date: "${dateString}"`);
  
  // Check if the input is a string
  if (typeof dateString !== 'string') {
    console.log(`Date is not a string: ${typeof dateString}`);
    return false;
  }
  
  // Check regex pattern
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    console.log(`Date doesn't match regex pattern: ${dateString}`);
    return false;
  }

  // Parse the date
  const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
  if (isNaN(date.getTime())) {
    console.log(`Date is invalid: ${dateString}`);
    return false;
  }

  // Check if the date string matches the parsed date (handles invalid dates like Feb 30)
  const [year, month, day] = dateString.split('-').map(Number);
  const isValid = date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
         
  console.log(`Date validation result: ${isValid} for ${dateString}`);
  console.log(`Parsed: ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
  
  return isValid;
}

/**
 * Format a date as MM-DD string
 */
function formatMonthDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}
