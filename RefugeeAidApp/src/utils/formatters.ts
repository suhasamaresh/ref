// Date and time formatters
export const formatters = {
  // Date formatting
  date: {
    short: (date: Date | string): string => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    },

    long: (date: Date | string): string => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },

    time: (date: Date | string): string => {
      const d = new Date(date);
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    },

    dateTime: (date: Date | string): string => {
      const d = new Date(date);
      return `${formatters.date.short(d)} at ${formatters.date.time(d)}`;
    },
  },

  // Currency formatting
  currency: {
    usd: (amount: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    },

    format: (amount: number, currency: string = 'USD'): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(amount);
    },
  },

  // Number formatting
  number: {
    compact: (num: number): string => {
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(num);
    },

    percentage: (num: number, decimals: number = 0): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num / 100);
    },

    decimal: (num: number, decimals: number = 2): string => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    },
  },

  // Phone number formatting
  phone: {
    us: (phone: string): string => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      } else if (cleaned.length === 11 && cleaned === '1') {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
      }
      return phone;
    },

    international: (phone: string, countryCode: string = '+1'): string => {
      const cleaned = phone.replace(/\D/g, '');
      return `${countryCode} ${cleaned}`;
    },
  },

  // Address formatting
  address: {
    full: (address: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    }): string => {
      const parts = [
        address.street,
        address.city,
        address.state,
        address.postalCode,
        address.country,
      ].filter(Boolean);
      
      return parts.join(', ');
    },

    short: (address: {
      city?: string;
      state?: string;
      country?: string;
    }): string => {
      const parts = [address.city, address.state, address.country].filter(Boolean);
      return parts.join(', ');
    },
  },

  // Text formatting
  text: {
    capitalize: (text: string): string => {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    titleCase: (text: string): string => {
      return text.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    },

    truncate: (text: string, maxLength: number, suffix: string = '...'): string => {
      if (text.length <= maxLength) return text;
      return text.substr(0, maxLength - suffix.length) + suffix;
    },

    stripHtml: (html: string): string => {
      return html.replace(/<[^>]*>/g, '');
    },
  },
};
