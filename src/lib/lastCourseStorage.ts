const LAST_COURSE_ID_KEY = "lxp:lastCourseId";

export function getLastCourseId(): string | null {
  try {
    return localStorage.getItem(LAST_COURSE_ID_KEY);
  } catch {
    return null;
  }
}

export function setLastCourseId(courseId: string): void {
  try {
    localStorage.setItem(LAST_COURSE_ID_KEY, courseId);
  } catch {
    // ignore quota / private mode
  }
}
