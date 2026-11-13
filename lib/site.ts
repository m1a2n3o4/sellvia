export const SITE = {
  name: 'SatyaSell',
  url: 'https://www.satyasell.com',
  email: 'admin@satyasell.com',
  phoneDisplay: '+91 77802 25235',
  phoneTel: '+917780225235',
  whatsappNumber: '917780225235',
  address: {
    line1: 'B-3705, Candeur40',
    line2: 'Miyapur, Hyderabad',
    region: 'Telangana',
    country: 'India',
  },
  addressOneLine: 'B-3705, Candeur40, Miyapur, Hyderabad, Telangana, India',
  whatsappUrl: (text = 'Hi SatyaSell, I want to know more') =>
    `https://wa.me/917780225235?text=${encodeURIComponent(text)}`,
  effectiveDate: '12 November 2026',
};
