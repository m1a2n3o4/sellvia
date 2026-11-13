export const SITE = {
  name: 'SatyaSell',
  url: 'https://www.satyasell.com',
  email: 'admin@satyasell.com',
  phoneDisplay: '+91 77802 25235',
  phoneTel: '+917780225235',
  whatsappNumber: '917780225235',
  address: {
    line1: 'Flat 1-94, Ramaiah Nilayam, Irkigudem, Block A, Main Road',
    line2: 'Miryalaguda, Nalgonda',
    region: 'Telangana 508355',
    locality: 'Miryalaguda',
    postalCode: '508355',
    stateOnly: 'Telangana',
    country: 'India',
  },
  addressOneLine: 'Flat 1-94, Ramaiah Nilayam, Irkigudem, Block A, Main Road, Miryalaguda, Nalgonda, Telangana 508355, India',
  whatsappUrl: (text = 'Hi SatyaSell, I want to know more') =>
    `https://wa.me/917780225235?text=${encodeURIComponent(text)}`,
  // Legal identity shown on the website (must match Meta Business Manager + Udyam certificate)
  legalName: 'SatyaSell',
  entityType: 'Proprietorship',
  udyamNo: 'UDYAM-TS-07-0121076',
  registrationLine: 'SatyaSell (Proprietorship) \u00b7 Udyam Reg. No. UDYAM-TS-07-0121076',
  effectiveDate: '12 November 2026',
};
