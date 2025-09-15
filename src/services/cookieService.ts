// Cookie utilities for session management
export class CookieService {
  /**
   * Set a cookie with options
   */
  static setCookie(name: string, value: string, days: number = 30): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * Get a cookie value
   */
  static getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Delete a cookie
   */
  static deleteCookie(name: string): void {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  /**
   * Check if cookies are enabled
   */
  static areCookiesEnabled(): boolean {
    try {
      const testCookie = 'test_cookie';
      this.setCookie(testCookie, 'test', 1);
      const enabled = this.getCookie(testCookie) === 'test';
      this.deleteCookie(testCookie);
      return enabled;
    } catch {
      return false;
    }
  }

  /**
   * Delete all poll-related cookies (session cookies)
   */
  static clearAllPollCookies(): void {
    const allCookies = document.cookie.split(';');
    for (let i = 0; i < allCookies.length; i++) {
      let cookie = allCookies[i];
      while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
      const name = cookie.split('=')[0];
      
      // Clear session cookies and poll-related cookies
      if (name.startsWith('session_') || name === 'voting_session_token') {
        this.deleteCookie(name);
      }
    }
  }
}