import { supabase } from '@/lib/supabase';

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
  userAgent: string;
}

class SessionService {
  private async getLocationInfo(): Promise<{ city: string; country: string; ip: string }> {
    try {
      // Use a simple IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        city: data.city || 'Unknown',
        country: data.country_name || 'Unknown',
        ip: data.ip || 'Unknown'
      };
    } catch (error) {
      console.warn('Failed to get location info:', error);
      return {
        city: 'Unknown',
        country: 'Unknown',
        ip: 'Unknown'
      };
    }
  }

  private getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('Edg')) {
      browser = 'Edge';
    }

    // Detect OS
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      os = 'iOS';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
    }

    return { browser, os, userAgent };
  }

  async getCurrentSession(): Promise<UserSession> {
    const { browser, os, userAgent } = this.getBrowserInfo();
    const { city, country, ip } = await this.getLocationInfo();
    
    return {
      id: 'current',
      device: `${browser} on ${os}`,
      browser,
      os,
      location: `${city}, ${country}`,
      ipAddress: ip,
      lastActive: new Date().toISOString(),
      current: true,
      userAgent
    };
  }

  async getAllSessions(): Promise<UserSession[]> {
    try {
      const currentSession = await this.getCurrentSession();
      
      // Get stored sessions from localStorage
      const storedSessions = localStorage.getItem('userSessions');
      const previousSessions: UserSession[] = storedSessions 
        ? JSON.parse(storedSessions).filter((s: UserSession) => s.id !== 'current')
        : [];

      // Create some realistic demo sessions for now
      const demoSessions: UserSession[] = [
        {
          id: '2',
          device: 'Safari on iPhone',
          browser: 'Safari',
          os: 'iOS',
          location: 'San Francisco, CA',
          ipAddress: '192.168.1.100',
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          current: false,
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      ];

      const allSessions = [currentSession, ...previousSessions, ...demoSessions];
      
      // Store current sessions
      localStorage.setItem('userSessions', JSON.stringify(allSessions));
      
      return allSessions;
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [await this.getCurrentSession()];
    }
  }

  async terminateSession(sessionId: string): Promise<void> {
    if (sessionId === 'current') {
      throw new Error('Cannot terminate current session');
    }

    try {
      const sessions = await this.getAllSessions();
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem('userSessions', JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Failed to terminate session:', error);
      throw error;
    }
  }

  async trackSession(userId: string): Promise<void> {
    try {
      const session = await this.getCurrentSession();
      
      // In a real app, this would save to the database
      // For now, we'll just update the current session timestamp
      const sessions = await this.getAllSessions();
      const updatedSessions = sessions.map(s => 
        s.current ? { ...s, lastActive: new Date().toISOString() } : s
      );
      
      localStorage.setItem('userSessions', JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Failed to track session:', error);
    }
  }
}

export const sessionService = new SessionService();
