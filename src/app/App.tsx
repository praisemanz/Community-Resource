import { useState, useMemo, useEffect, useCallback } from 'react';
import { Bell, Shield, Info, FileText, AlertTriangle as AlertIcon, ArrowUp, SearchX } from 'lucide-react';

// === MVC: MODEL imports ===
import type { Alert } from './models/Alert.ts';
import type { Resource } from './models/Resource.ts';
import type { Category } from './models/Category.ts';
import type { CommunityGroup } from './models/CommunityGroup.ts';
import type { SafeSpace } from './models/SafeSpace.ts';
import type { CommunityEvent } from './models/CommunityEvent.ts';
import type { ICEReport } from './models/ICEReport.ts';

// === OBSERVER PATTERN (Pattern #1) ===
import type { AlertObserver } from './patterns/observer/AlertObserver.ts';
import { AlertStore } from './patterns/observer/AlertStore.ts';
import { WeatherAlertService } from './patterns/observer/WeatherAlertService.ts';
import { EmergencyAlertService } from './patterns/observer/EmergencyAlertService.ts';

// === STRATEGY PATTERN (Pattern #2) ===
import { FilterContext } from './patterns/strategy/FilterContext.ts';
import { CategoryFilterStrategy } from './patterns/strategy/CategoryFilterStrategy.ts';
import { CommunityFilterStrategy } from './patterns/strategy/CommunityFilterStrategy.ts';
import { SearchFilterStrategy } from './patterns/strategy/SearchFilterStrategy.ts';

// === MVC: VIEW imports ===
import { AlertBanner } from './components/AlertBanner.tsx';
import { ResourceCard } from './components/ResourceCard.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { CommunityFilter } from './components/CommunityFilter.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import { SafeSpaceCard } from './components/SafeSpaceCard.tsx';
import { ThemeToggle } from './components/ThemeToggle.tsx';
import { RedCardViewer } from './components/RedCardViewer.tsx';
import { ICEReportForm } from './components/ICEReportForm.tsx';
import { EventCard } from './components/EventCard.tsx';
import { ToastContainer } from './components/Toast.tsx';
import type { ToastData } from './components/Toast.tsx';

// Oklahoma City community data
const initialAlerts: Alert[] = [
  {
    id: '1',
    type: 'urgent',
    title: 'ICE Activity Reported',
    message: 'Increased enforcement activity reported in downtown Oklahoma City. Community members have observed unmarked vehicles near the courthouse area.',
    location: 'Downtown OKC, near N Robinson Ave & W Main St',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    icon: 'safety',
    safetyTips: [
      'Avoid the reported area if possible',
      'Do not open your door without a valid warrant signed by a judge',
      'Exercise your right to remain silent',
      'Contact Catholic Charities OKC Immigration Legal Services: (405) 523-3001',
      'Carry your know-your-rights card at all times',
      'Do not sign any documents without speaking to a lawyer',
    ],
  },
  {
    id: '2',
    type: 'warning',
    title: 'Severe Weather Warning',
    message: 'Severe thunderstorm and tornado watch in effect for central Oklahoma. Emergency shelters are open across OKC.',
    location: 'Oklahoma City metro area',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    icon: 'weather',
    safetyTips: [
      'Seek shelter in a sturdy building away from windows immediately',
      'Go to the lowest floor or interior room if a tornado warning is issued',
      'Emergency shelters: City Rescue Mission (800 W California Ave) and Westtown Campus (1724 NW 4th St)',
      'Monitor KFOR, KOCO, or KOKH for tornado updates',
      'Have a go-bag ready: water, medications, ID documents, and flashlight',
    ],
  },
];

const resources: Resource[] = [
  {
    id: '1',
    name: 'Regional Food Bank of Oklahoma',
    category: 'food',
    description: 'Oklahoma\'s largest food bank — distributes millions of meals annually. Call or text to find a nearby partner pantry. No ID required at most partner locations.',
    address: '3355 S Purdue Ave, Oklahoma City, OK 73179',
    phone: '(405) 972-1111',
    hours: 'Mon-Fri: 8AM-5PM (call to locate nearest distribution site)',
    languages: ['English', 'Spanish'],
    website: 'https://www.regionalfoodbank.org',
    servingCommunities: ['African American', 'Hispanic/Latino', 'Immigrant', 'Native American'],
    accessibilityFeatures: ['Wheelchair accessible', 'Drive-through distribution available'],
  },
  {
    id: '7a',
    name: 'ISGOC Mercy Mission Food Pantry',
    category: 'food',
    description: 'Halal-friendly food pantry operated by the Islamic Society of Greater Oklahoma City in partnership with the Regional Food Bank. Open to all community members regardless of faith.',
    address: '3840 N St Clair Ave, Oklahoma City, OK 73112',
    phone: '(405) 946-2116',
    hours: 'Contact mosque for current pantry schedule',
    languages: ['English', 'Arabic', 'Urdu', 'Somali'],
    servingCommunities: ['Muslim', 'Immigrant', 'Refugee/Asylum'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  {
    id: '7b',
    name: 'Kosher Food Bank',
    category: 'food',
    description: 'Certified kosher food pantry and hot meals. Serving Jewish community with dignity and respect.',
    address: '333 Shalom Street, Oklahoma City, OK',
    phone: '(555) 654-3210',
    hours: 'Sun-Thu: 10AM-4PM, Closed Friday & Saturday',
    languages: ['English', 'Hebrew', 'Yiddish', 'Russian'],
    servingCommunities: ['Jewish', 'Immigrant'],
    accessibilityFeatures: ['Wheelchair accessible', 'Elevator access'],
  },
  {
    id: '2',
    name: 'Christ Community Health Coalition',
    category: 'healthcare',
    description: 'Free medical clinic staffed by volunteer physicians. Free child vaccinations available through the Oklahoma Caring Van on the second Tuesday of each month, 4–6 PM.',
    address: '101 SW 25th Street, Oklahoma City, OK 73109',
    phone: '(405) 601-4948',
    hours: 'Every Tuesday: 4PM-8PM',
    languages: ['English', 'Spanish'],
    servingCommunities: ['Hispanic/Latino', 'Immigrant', 'African American'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  {
    id: '2b',
    name: 'Crossings Community Clinic',
    category: 'healthcare',
    description: 'Free medical, dental, and vision care for uninsured adults in northwest OKC. Income-based eligibility. No appointment needed for walk-in hours.',
    address: '10255 N Pennsylvania Ave, Oklahoma City, OK 73120',
    phone: '(405) 749-0800',
    hours: 'Mon-Fri: 9AM-12PM & 1:15PM-5PM',
    languages: ['English', 'Spanish'],
    website: 'https://www.crossingsclinic.org',
    servingCommunities: ['African American', 'Hispanic/Latino', 'Disability'],
    accessibilityFeatures: ['Wheelchair accessible', 'Accessible parking'],
  },
  {
    id: '14a',
    name: 'HOPE Community Services',
    category: 'mental-health',
    description: 'State-funded community mental health center with sliding-scale fees as low as $10 per session. Individual therapy, group counseling, and psychiatric services available.',
    address: '6100 S Walker Ave, Oklahoma City, OK 73139',
    phone: '(405) 634-4400',
    hours: 'Mon-Fri: 8AM-5PM',
    languages: ['English', 'Spanish'],
    website: 'https://www.hopecsokc.org',
    servingCommunities: ['African American', 'Hispanic/Latino', 'Native American', 'Disability'],
    accessibilityFeatures: ['Wheelchair accessible', 'Telehealth available'],
  },
  {
    id: '14b',
    name: 'Eating Disorder Recovery Program',
    category: 'mental-health',
    description: 'Comprehensive treatment for anorexia, bulimia, binge eating disorder, and body image issues. Nutritionists and therapists on staff.',
    address: '456 Hope Lane, Oklahoma City, OK',
    phone: '(555) 222-3333',
    hours: 'Mon-Fri: 9AM-7PM, Sat: 10AM-2PM',
    languages: ['English', 'Spanish'],
    servingCommunities: ['All communities welcome', 'LGBTQ+'],
    accessibilityFeatures: ['Wheelchair accessible', 'Private consultation rooms'],
  },
  {
    id: '14c',
    name: 'FOCIS Counseling Services',
    category: 'mental-health',
    description: 'Nonprofit counseling agency offering trauma-focused CBT, individual and family therapy. No one turned away for inability to pay. Accepts SoonerCare, Medicaid, and sliding scale.',
    address: 'Oklahoma City, OK (call for appointment address)',
    phone: '(405) 810-5032',
    hours: 'Mon-Fri: 9AM-6PM',
    languages: ['English', 'Spanish'],
    website: 'https://www.focisokc.org',
    servingCommunities: ['Refugee/Asylum', 'Immigrant', 'LGBTQ+', 'Native American'],
    accessibilityFeatures: ['Wheelchair accessible', 'Telehealth available'],
  },
  {
    id: '14',
    name: 'Jewish Family & Community Services',
    category: 'mental-health',
    description: 'Mental health counseling, case management, Holocaust survivor support, and family services.',
    address: '444 Shalom Drive, Oklahoma City, OK',
    phone: '(555) 456-0123',
    hours: 'Mon-Thu: 9AM-7PM, Fri: 9AM-3PM',
    languages: ['English', 'Hebrew', 'Russian', 'Yiddish'],
    servingCommunities: ['Jewish', 'Immigrant'],
    accessibilityFeatures: ['Wheelchair accessible', 'TTY available'],
  },
  {
    id: '3',
    name: 'Catholic Charities OKC – Immigration Legal Services',
    category: 'legal',
    description: 'Affordable immigration legal services for low-income individuals: DACA renewals, citizenship applications, family petitions, and know-your-rights workshops. Free virtual DACA clinics every third Saturday via Dream Action Oklahoma.',
    address: '1232 N Classen Blvd, Oklahoma City, OK 73106',
    phone: '(405) 523-3001',
    hours: 'Mon-Fri: 8AM-5PM',
    languages: ['English', 'Spanish', 'Somali', 'Vietnamese'],
    website: 'https://catholiccharitiesok.org',
    servingCommunities: ['Immigrant', 'Refugee/Asylum', 'Hispanic/Latino'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  {
    id: '4',
    name: 'Black Liberated Arts Center (BLAC)',
    category: 'cultural',
    description: 'Oklahoma\'s premier African American arts and culture nonprofit. Presents music, theater, dance, and the annual Charlie Christian International Music Festival. Youth education emphasis.',
    address: '4500 N Lincoln Blvd, Suite 106, Oklahoma City, OK 73105',
    phone: '(405) 524-3800',
    hours: 'Mon-Fri: 10AM-5PM (event hours vary)',
    languages: ['English'],
    website: 'https://www.blacinc.org',
    servingCommunities: ['African American'],
    accessibilityFeatures: ['Wheelchair accessible', 'Accessible parking'],
  },
  {
    id: '5',
    name: 'Islamic Society of Greater Oklahoma City (ISGOC)',
    category: 'cultural',
    description: 'Main mosque and community hub for OKC Muslims. Prayer space, Quran classes, Shifa Free Health Clinic, community food pantry, and women\'s resource center all on campus. All faiths welcome for community services.',
    address: '3815 St Clair Ave, Oklahoma City, OK 73112',
    phone: '(405) 946-2116',
    hours: 'Daily: 5AM-10PM (services vary)',
    languages: ['English', 'Arabic', 'Urdu', 'Somali', 'Bengali'],
    website: 'https://www.isgoc.com',
    servingCommunities: ['Muslim', 'Immigrant', 'Refugee/Asylum'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  {
    id: '6',
    name: 'Oklahoma City Indian Clinic (OKCIC)',
    category: 'healthcare',
    description: 'Comprehensive healthcare for American Indians representing over 220 tribes. Services include family medicine, dental, behavioral health, optometry, diabetes prevention, youth programs, and fitness. No tribal membership documentation required to be seen.',
    address: '4913 W Reno Ave, Oklahoma City, OK 73127',
    phone: '(405) 948-4900',
    hours: 'Mon-Fri: 8AM-5PM',
    languages: ['English', 'Cherokee', 'Choctaw'],
    website: 'https://okcic.com',
    servingCommunities: ['Native American'],
    accessibilityFeatures: ['Wheelchair accessible', 'Accessible parking', 'TTY available'],
  },
  {
    id: '7',
    name: 'Diversity Center of Oklahoma',
    category: 'advocacy',
    description: 'OKC\'s main LGBTQ+ community resource center. Offers mental health counseling, anti-violence services, HIV/STI testing, youth programs, legal assistance, and community outreach.',
    address: '2242 NW 39th Street, Oklahoma City, OK 73112',
    phone: '(405) 604-5217',
    hours: 'Mon-Fri: 10AM-6PM',
    languages: ['English', 'Spanish'],
    website: 'https://www.diversitycenterofoklahoma.org',
    servingCommunities: ['LGBTQ+'],
    accessibilityFeatures: ['Wheelchair accessible', 'Gender-neutral restrooms', 'ASL interpretation available'],
  },
  {
    id: '8',
    name: 'Asian Pacific Islander Health Clinic',
    category: 'healthcare',
    description: 'Culturally sensitive healthcare, mental health services, and wellness programs.',
    address: '333 Pacific Avenue, Oklahoma City, OK',
    phone: '(555) 890-1234',
    hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-1PM',
    languages: ['English', 'Mandarin', 'Cantonese', 'Vietnamese', 'Korean', 'Tagalog'],
    servingCommunities: ['Asian American', 'Pacific Islander'],
    accessibilityFeatures: ['Wheelchair accessible', 'Braille signage'],
  },
  {
    id: '9',
    name: 'Catholic Charities OKC – Refugee Resettlement',
    category: 'advocacy',
    description: 'One of four official refugee resettlement agencies in Oklahoma. Provides airport reception, housing, food, clothing, English instruction, job placement, and case management. Has resettled thousands of Afghan and other refugees.',
    address: '1232 N Classen Blvd, Oklahoma City, OK 73106',
    phone: '(405) 523-3015',
    hours: 'Mon-Fri: 8AM-5PM',
    languages: ['English', 'Arabic', 'Somali', 'Dari', 'Pashto', 'Burmese'],
    website: 'https://catholiccharitiesok.org/refugee-services',
    servingCommunities: ['Refugee/Asylum', 'Immigrant'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  {
    id: '10',
    name: 'Sikh Gurdwara & Community Kitchen',
    category: 'cultural',
    description: 'Free community meals (langar), religious services, and social support for all. Everyone is welcome at the langar table regardless of faith, background, or income.',
    address: '666 Seva Lane, Oklahoma City, OK',
    phone: '(555) 012-3456',
    hours: 'Daily: 6AM-9PM',
    languages: ['English', 'Punjabi', 'Hindi'],
    servingCommunities: ['Sikh', 'Immigrant'],
    accessibilityFeatures: ['Wheelchair accessible', 'Elevator access'],
  },
  {
    id: '11',
    name: 'Oklahoma Dept of Rehabilitation Services',
    category: 'advocacy',
    description: 'State agency serving over 88,000 Oklahomans with disabilities annually. Vocational rehabilitation, employment services, independent living programs, assistive technology, and disability benefits determination.',
    address: '3535 NW 58th Street, Suite 500, Oklahoma City, OK 73112',
    phone: '(405) 951-3400',
    hours: 'Mon-Fri: 8AM-5PM',
    languages: ['English', 'Spanish', 'ASL'],
    website: 'https://www.okdrs.gov',
    servingCommunities: ['Disability'],
    accessibilityFeatures: ['Fully accessible building', 'Assistive listening devices', 'TTY: (800) 845-8476'],
  },
  {
    id: '12',
    name: 'Latino Community Development Agency (LCDA)',
    category: 'education',
    description: 'Bilingual family services for the OKC Latino community: Early Head Start (Tony Reyes Bilingual CDC), ESL classes, youth programs, mental health counseling, financial wellness, and substance abuse support.',
    address: '420 SW 10th Street, Oklahoma City, OK 73109',
    phone: '(405) 236-4667',
    hours: 'Mon-Fri: 8AM-5PM',
    languages: ['English', 'Spanish'],
    website: 'https://www.lcdaok.com',
    servingCommunities: ['Hispanic/Latino', 'Immigrant'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  {
    id: '13',
    name: 'Buddhist Temple & Meditation Center',
    category: 'cultural',
    description: 'Meditation classes, dharma talks, community events, and spiritual counseling.',
    address: '222 Enlightenment Road, Oklahoma City, OK',
    phone: '(555) 345-9012',
    hours: 'Mon-Sun: 7AM-9PM',
    languages: ['English', 'Thai', 'Vietnamese', 'Mandarin'],
    servingCommunities: ['Buddhist', 'Asian American'],
  },
  {
    id: '15',
    name: 'City Rescue Mission',
    category: 'housing',
    description: 'Emergency shelter, meals, and recovery programs in downtown OKC. Open 24/7. Provides rental assistance, case management, and transitional housing for individuals and families.',
    address: '800 W California Ave, Oklahoma City, OK 73106',
    phone: '(405) 232-2709',
    hours: '24/7 Emergency shelter',
    languages: ['English', 'Spanish'],
    website: 'https://cityrescue.org',
    servingCommunities: ['African American', 'Hispanic/Latino', 'Native American', 'Disability'],
    accessibilityFeatures: ['Wheelchair accessible', 'Service animals welcome'],
  },
  {
    id: '16',
    name: 'Pacific Islander Community Association',
    category: 'cultural',
    description: 'Cultural programs, youth services, health education, and community advocacy for Pacific Islander communities.',
    address: '666 Ocean View Terrace, Oklahoma City, OK',
    phone: '(555) 678-2345',
    hours: 'Tue-Sat: 10AM-6PM',
    languages: ['English', 'Samoan', 'Tongan', 'Marshallese'],
    servingCommunities: ['Pacific Islander'],
  },
  {
    id: '17',
    name: 'Transgender Health Services',
    category: 'healthcare',
    description: 'Gender-affirming care, hormone therapy, mental health support, and legal name change assistance.',
    address: '777 Rainbow Avenue, Oklahoma City, OK',
    phone: '(555) 789-3456',
    hours: 'Mon-Fri: 9AM-6PM',
    languages: ['English', 'Spanish'],
    servingCommunities: ['LGBTQ+'],
    accessibilityFeatures: ['Wheelchair accessible', 'All-gender restrooms'],
  },
  {
    id: '18',
    name: 'Tony Reyes Bilingual Child Development Center',
    category: 'childcare',
    description: 'NAEYC-accredited Early Head Start for infants and toddlers (birth–age 3) from Spanish-speaking homes. Full-day bilingual program with developmental screenings. Accepts DHS childcare subsidies. Income-based eligibility.',
    address: '5716 S Western Ave, Oklahoma City, OK 73109',
    phone: '(405) 236-4667',
    hours: 'Mon-Fri: 7AM-5:30PM',
    languages: ['English', 'Spanish'],
    servingCommunities: ['Hispanic/Latino', 'Immigrant'],
    accessibilityFeatures: ['Wheelchair accessible', 'Sensory-friendly spaces'],
  },
  // ——— Tulsa ———
  {
    id: 't1',
    name: 'Community Food Bank of Eastern Oklahoma',
    category: 'food',
    description: 'Serves 24 counties in eastern Oklahoma. Distributes to partner pantries; offers prepared foods, fresh produce, nutrition education, and emergency food. Call ahead before visiting.',
    address: '1304 N Kenosha Ave, Tulsa, OK 74106',
    phone: '(918) 585-2800',
    hours: 'Mon-Fri: 8AM-4:30PM',
    languages: ['English', 'Spanish'],
    website: 'https://okfoodbank.org',
    servingCommunities: ['African American', 'Hispanic/Latino', 'Immigrant', 'Native American'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  {
    id: 't2',
    name: 'Catholic Charities of Eastern Oklahoma – Immigration (San Toribio Romo)',
    category: 'legal',
    description: 'Immigration legal services: DACA, asylum, family petitions, naturalization, TPS, U/T visas, VAWA, green card renewals. Four attorneys and DOJ-accredited reps. Nominal fees; no one turned away for inability to pay.',
    address: '2450 N Harvard Ave, Tulsa, OK 74158',
    phone: '(918) 508-7169',
    hours: 'Mon-Fri: 9AM-4:30PM (closed noon-1PM)',
    languages: ['English', 'Spanish', 'Burmese', 'Russian'],
    website: 'https://cceok.org/immigration',
    servingCommunities: ['Immigrant', 'Refugee/Asylum', 'Hispanic/Latino'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  {
    id: 't3',
    name: 'Dennis R. Neill Equality Center (Oklahomans for Equality)',
    category: 'advocacy',
    description: 'One of the largest LGBTQ+ centers in the region. Youth programs, drop-in services, health and wellness education, mental health support, HIV testing, lending library, and event space.',
    address: '621 E 4th St, Tulsa, OK 74120',
    phone: '(918) 743-4297',
    hours: 'Mon-Sat: 12PM-9PM, Sun: 12PM-6PM',
    languages: ['English', 'Spanish'],
    website: 'https://okeq.org',
    servingCommunities: ['LGBTQ+'],
    accessibilityFeatures: ['Wheelchair accessible', 'Gender-neutral restrooms'],
  },
  {
    id: 't4',
    name: 'Good Samaritan Health Services – Tulsa',
    category: 'healthcare',
    description: 'Free primary care, women\'s health, chronic disease management, vision and diabetic care at 14 Tulsa County locations. First-come, first-served; arrive early. All services free.',
    address: 'Multiple Tulsa County locations (call for nearest site)',
    phone: '(918) 710-4222',
    hours: 'Vary by location',
    languages: ['English', 'Spanish'],
    website: 'https://www.goodsamaritanhealth.org',
    servingCommunities: ['Hispanic/Latino', 'Immigrant', 'African American', 'Native American'],
    accessibilityFeatures: ['Wheelchair accessible at most sites'],
  },
  {
    id: 't5',
    name: 'Indian Health Care Resource Center of Tulsa (IHCRC)',
    category: 'healthcare',
    description: 'Urban Indian outpatient clinic for citizens of any federally recognized tribe. Medical, behavioral health, dental, optometry, pharmacy, and wellness programs. Free transportation available.',
    address: '550 S Peoria Ave, Tulsa, OK 74120',
    phone: '(918) 588-1900',
    hours: 'Mon-Fri: 6:45AM-6PM (walk-ins 7AM-4PM Mon)',
    languages: ['English', 'Cherokee', 'Creek'],
    website: 'https://www.ihcrc.org',
    servingCommunities: ['Native American'],
    accessibilityFeatures: ['Wheelchair accessible', 'Drive-thru pharmacy (918) 382-1270'],
  },
  {
    id: 't6',
    name: 'Catholic Charities of Eastern Oklahoma – Refugee Resettlement',
    category: 'advocacy',
    description: 'Oklahoma\'s primary refugee resettlement agency. Reception, housing, employment, cultural orientation, and case management for the first 90 days. Serves hundreds of refugees annually.',
    address: '2450 N Harvard Ave, Tulsa, OK 74158',
    phone: '(918) 949-4673',
    hours: 'Mon-Fri: 9AM-4:30PM',
    languages: ['English', 'Arabic', 'Dari', 'Pashto', 'Burmese', 'Russian'],
    website: 'https://cceok.org/refugees',
    servingCommunities: ['Refugee/Asylum', 'Immigrant'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  {
    id: 't7',
    name: 'Community Health Connection – Tulsa Eastside',
    category: 'healthcare',
    description: 'Medical and behavioral health on a sliding fee scale. Accepts SoonerCare, Medicare, and Insure Oklahoma. Serves uninsured and underinsured families in east Tulsa.',
    address: '9912 E 21st St, Tulsa, OK 74129',
    phone: '(918) 622-0641',
    hours: 'Mon-Fri: 8AM-6PM',
    languages: ['English', 'Spanish'],
    servingCommunities: ['Hispanic/Latino', 'Immigrant', 'Native American'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  // ——— Edmond ———
  {
    id: 'e1',
    name: 'HOPE Center of Edmond',
    category: 'food',
    description: 'Food pantry for Edmond and Arcadia (zip codes 73034, 73003, 73013, 73007, 73012, 73025). Once per month; photo ID and proof of residency required. Income guidelines apply.',
    address: '1251 N Broadway, Suite A & B, Edmond, OK 73034',
    phone: '(405) 348-1340',
    hours: 'Mon-Thu: 8:30AM-4PM, Fri: 8:30AM-12PM',
    languages: ['English', 'Spanish'],
    website: 'https://hopecenterofedmond.com',
    servingCommunities: ['Hispanic/Latino', 'Immigrant', 'African American'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  {
    id: 'e2',
    name: 'Samaritan House of Edmond',
    category: 'housing',
    description: 'Food pantry, rent assistance, and utility assistance for families in need. Adjacent to St. John the Baptist Catholic Church. Bring ID and proof of residency.',
    address: '42 E 9th St, Edmond, OK 73034',
    phone: '(405) 216-7554',
    hours: 'Mon-Fri: 9AM-12PM',
    languages: ['English', 'Spanish'],
    servingCommunities: ['Hispanic/Latino', 'Immigrant', 'African American'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  // ——— Norman ———
  {
    id: 'n1',
    name: 'Food & Shelter, Inc. – Norman',
    category: 'housing',
    description: 'Emergency and long-term shelter, day shelter (bathrooms, showers, laundry), homelessness prevention, and rapid re-housing. Case managers Mon-Fri. Call for shelter requests; do not rely on email.',
    address: '201 Reed Ave, Norman, OK 73071',
    phone: '(405) 360-4954',
    hours: 'Day shelter: 8AM-4PM daily; case managers Mon-Fri',
    languages: ['English', 'Spanish'],
    website: 'https://foodandshelterinc.org',
    servingCommunities: ['African American', 'Hispanic/Latino', 'Native American', 'Disability'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  // ——— Lawton ———
  {
    id: 'l1',
    name: 'Lawton Food Bank',
    category: 'food',
    description: 'Serves Comanche County and southwest Oklahoma. TEFAP distribution, senior boxes, and produce pop-in. Schedule appointments via phone or Facebook. Established 1985.',
    address: '1819 SW Sheridan Rd, Lawton, OK 73505',
    phone: '(580) 353-7994',
    hours: 'Mon & Wed: 10AM-1PM; Tue & Thu: 1PM-5:30PM; senior/produce dates vary',
    languages: ['English', 'Spanish'],
    website: 'https://www.lawtonfoodbank.org',
    servingCommunities: ['African American', 'Hispanic/Latino', 'Native American', 'Immigrant'],
    accessibilityFeatures: ['Wheelchair accessible'],
  },
  // ——— Stillwater ———
  {
    id: 's1',
    name: 'Our Daily Bread Food & Resource Center',
    category: 'food',
    description: 'Client-choice pantry (shop like a small grocery) for Payne County. Visit every 28 days. Referrals to other community resources. Spanish available; wheelchair accessible.',
    address: '701 E 12th Ave, Stillwater, OK 74074',
    phone: '(405) 533-2555',
    hours: 'Mon: 1-3:30PM, Tue: 3-5:30PM, Thu: 11AM-1:30PM, 3rd Sat: 9-11:30AM',
    languages: ['English', 'Spanish'],
    website: 'https://www.ourdailybreadstillwater.org',
    servingCommunities: ['Hispanic/Latino', 'Immigrant', 'Native American'],
    accessibilityFeatures: ['Wheelchair accessible', 'Wi-Fi', 'Restrooms'],
  },
];

const safeSpaces: SafeSpace[] = [
  {
    id: '1',
    name: 'YWCA Oklahoma City',
    address: '2460 NW 39th Street, Oklahoma City, OK 73112',
    phone: '(405) 917-9922',
    type: 'shelter',
    available24h: true,
  },
  {
    id: '2',
    name: 'Westtown Homeless Resource Campus',
    address: '1724 NW 4th Street, Oklahoma City, OK 73106',
    phone: '(405) 415-8410',
    type: 'community-center',
    available24h: false,
  },
  {
    id: '3',
    name: 'City Rescue Mission',
    address: '800 W California Ave, Oklahoma City, OK 73106',
    phone: '(405) 232-2709',
    type: 'shelter',
    available24h: true,
  },
  {
    id: '4',
    name: 'DVIS – Domestic Violence Intervention Services (Tulsa)',
    address: '3124 E Apache St, Tulsa, OK 74110',
    phone: '(918) 743-5763',
    type: 'shelter',
    available24h: true,
  },
  {
    id: '5',
    name: 'Food & Shelter, Inc. Day Shelter (Norman)',
    address: '201 Reed Ave, Norman, OK 73071',
    phone: '(405) 360-4954',
    type: 'community-center',
    available24h: false,
  },
];

const events: CommunityEvent[] = [
  {
    id: 'e1',
    name: 'Oklahoma PrideFest 2026',
    type: 'pride',
    description: 'Oklahoma City\'s annual LGBTQ+ Pride celebration — one of the largest in the Southern Plains. Features a parade, live performances, food vendors, and a community resources fair.',
    date: '2026-06-27',
    time: '12:00 PM - 8:00 PM',
    location: 'NW 39th Street Paseo Arts District, Oklahoma City, OK',
    organizer: 'OKC Pride Inc. / Diversity Center of Oklahoma',
    isFree: true,
    registration: 'https://www.okcprideinc.org',
    targetCommunities: ['LGBTQ+', 'All allies welcome'],
  },
  {
    id: 'e1b',
    name: 'Tulsa Pride 2026',
    type: 'pride',
    description: 'Oklahoma\'s longest-running LGBTQ+ Pride festival. Parade on East 4th Street (Pride Street), festival with vendors and food trucks, Rainbow Run, and Picnic in the Park. Aligned with LGBTQ+ History Month and National Coming Out Day.',
    date: '2026-10-11',
    time: 'Parade & festival Sat; Rainbow Run Fri; Picnic Sun',
    location: 'East 4th Street (Pride Street) & Dennis R. Neill Equality Center, Tulsa, OK',
    organizer: 'Oklahomans for Equality (OKEQ)',
    isFree: true,
    registration: 'https://tulsapride.org',
    targetCommunities: ['LGBTQ+', 'All allies welcome'],
  },
  {
    id: 'e2',
    name: 'Black History Month Celebration',
    type: 'celebration',
    description: 'Celebrate Black excellence with live music, art exhibits, historical presentations, and soul food. All ages welcome. Presented by the Black Liberated Arts Center.',
    date: '2026-02-15',
    time: '2:00 PM - 7:00 PM',
    location: 'Black Liberated Arts Center, 4500 N Lincoln Blvd, Oklahoma City, OK',
    organizer: 'Black Liberated Arts Center (BLAC)',
    isFree: true,
    targetCommunities: ['African American', 'All communities welcome'],
  },
  {
    id: 'e3',
    name: 'Free DACA Clinic – Dream Action Oklahoma',
    type: 'information-session',
    description: 'Free virtual DACA clinic for both renewals and initial applications hosted by Dream Action Oklahoma. Register in advance. Held every third Saturday of the month via Zoom.',
    date: '2026-03-21',
    time: '10:00 AM - 1:00 PM',
    location: 'Virtual (Zoom — register at daok.org)',
    organizer: 'Dream Action Oklahoma & Catholic Charities OKC',
    isFree: true,
    registration: 'https://www.daok.org',
    targetCommunities: ['Immigrant', 'Refugee/Asylum', 'Hispanic/Latino'],
  },
  {
    id: 'e4',
    name: 'Lunar New Year Festival',
    type: 'cultural',
    description: 'Celebrate Asian Lunar New Year with traditional performances, lion dances, Asian cuisine, and cultural activities for children.',
    date: '2026-01-29',
    time: '11:00 AM - 5:00 PM',
    location: 'Asian District, N Classen Blvd, Oklahoma City, OK',
    organizer: 'Asian American Community Coalition of Oklahoma',
    isFree: true,
    targetCommunities: ['Asian American', 'Pacific Islander', 'All communities'],
  },
  {
    id: 'e5',
    name: 'Mental Health Support Group',
    type: 'support-group',
    description: 'Weekly support group for anxiety and depression. Safe, confidential space to share experiences and coping strategies. Drop-in welcome. Facilitated by HOPE Community Services counselors.',
    date: '2026-03-04',
    time: 'Every Wednesday, 6:30 PM - 8:00 PM',
    location: 'HOPE Community Services, 6100 S Walker Ave, Oklahoma City, OK',
    organizer: 'HOPE Community Services',
    isFree: true,
    targetCommunities: ['All communities welcome'],
  },
  {
    id: 'e6',
    name: 'Ramadan Community Iftar',
    type: 'cultural',
    description: 'Join us for communal breaking of fast during Ramadan at ISGOC. Halal meals provided, prayer space available. All faiths warmly welcomed.',
    date: '2026-03-25',
    time: '7:30 PM - 9:30 PM',
    location: 'Islamic Society of Greater Oklahoma City, 3815 St Clair Ave, Oklahoma City, OK',
    organizer: 'Islamic Society of Greater Oklahoma City (ISGOC)',
    isFree: true,
    targetCommunities: ['Muslim', 'All communities welcome'],
  },
  {
    id: 'e7',
    name: 'Disability Rights & Vocational Workshop',
    type: 'workshop',
    description: 'Learn about ADA rights, vocational rehabilitation, assistive technology, and DRS Oklahoma services. ASL interpretation provided. Presented by the Oklahoma Department of Rehabilitation Services.',
    date: '2026-03-20',
    time: '10:00 AM - 12:00 PM',
    location: 'Oklahoma Dept of Rehabilitation Services, 3535 NW 58th St, Suite 500, OKC',
    organizer: 'Oklahoma Dept of Rehabilitation Services',
    isFree: true,
    targetCommunities: ['Disability', 'Caregivers', 'Advocates'],
  },
  {
    id: 'e8',
    name: 'Latino Heritage Festival',
    type: 'celebration',
    description: 'Celebrate Latino culture with mariachi music, folkloric dance, traditional food, and kids activities. Bilingual programming. Organized by the Latino Community Development Agency.',
    date: '2026-09-15',
    time: '1:00 PM - 8:00 PM',
    location: 'Scissortail Park, 300 SW 7th St, Oklahoma City, OK',
    organizer: 'Latino Community Development Agency (LCDA)',
    isFree: true,
    targetCommunities: ['Hispanic/Latino', 'All communities'],
  },
  {
    id: 'e9',
    name: 'Red Earth FallFest – Indigenous Peoples\' Day',
    type: 'cultural',
    description: 'Annual Indigenous Peoples\' Day celebration at Myriad Botanical Gardens. Features an arts & crafts market from 130+ Native artists, youth powwow with fancy dance competition, and free family-friendly activities.',
    date: '2026-10-10',
    time: '10:00 AM - 5:00 PM',
    location: 'Myriad Botanical Gardens, 301 W Reno Ave, Oklahoma City, OK',
    organizer: 'Red Earth Inc.',
    isFree: true,
    registration: 'https://redearth.org',
    targetCommunities: ['Native American', 'All respectful visitors'],
  },
  {
    id: 'e10',
    name: 'OKC Sweetheart Powwow',
    type: 'cultural',
    description: 'Traditional powwow hosted by Oklahoma City Pow Wow Club. Features drumming, dance contests (hat & boot, 2-step, shawl), and a community dinner. Free admission.',
    date: '2026-02-07',
    time: '2:00 PM - 10:00 PM (dinner at 5:00 PM)',
    location: 'Bridgestone Intermediate School, Oklahoma City, OK',
    organizer: 'Oklahoma City Pow Wow Club',
    isFree: true,
    targetCommunities: ['Native American', 'All communities welcome'],
  },
  {
    id: 'e11',
    name: 'Red Earth Festival – Native American Arts',
    type: 'cultural',
    description: 'One of the nation\'s premier Native American art events. Over 130 Indigenous artists, live dance performances, traditional competitions, and four decades of celebrating Native arts and culture.',
    date: '2026-08-01',
    time: '10:00 AM - 6:00 PM',
    location: 'Oklahoma City Convention Center, 100 Mick Cornett Dr, Oklahoma City, OK',
    organizer: 'Red Earth Inc.',
    isFree: false,
    registration: 'https://redearth.org',
    targetCommunities: ['Native American', 'All communities welcome'],
  },
  {
    id: 'e12',
    name: 'Eating Disorder Recovery Workshop',
    type: 'workshop',
    description: 'Educational workshop on eating disorder recovery, body positivity, and support resources. For those in recovery and loved ones.',
    date: '2026-04-25',
    time: '2:00 PM - 4:00 PM',
    location: 'Oklahoma City, OK (location TBA)',
    organizer: 'Community Mental Health Coalition',
    isFree: true,
    targetCommunities: ['All communities welcome'],
  },
];

// === MVC: CONTROLLER ===
// App is the controller: it owns application state, registers design pattern hooks,
// and passes data/callbacks down to View components.
export default function App() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedCommunities, setSelectedCommunities] = useState<CommunityGroup[]>(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSafeSpaces, setShowSafeSpaces] = useState(false);
  const [showRedCard, setShowRedCard] = useState(false);
  const [showICEReport, setShowICEReport] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // UX: Visibility of System Status — toast notifications
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // UX: User Control and Freedom — Escape key closes any open modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showICEReport) setShowICEReport(false);
        else if (showRedCard) setShowRedCard(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showICEReport, showRedCard]);

  // === OBSERVER PATTERN: App registers itself as an AlertObserver ===
  // When ICEReportForm publishes a report via AlertStore, this update() is called automatically.
  useEffect(() => {
    const observer: AlertObserver = {
      update: (alert: Alert) => {
        setAlerts((prev) => [alert, ...prev]);
      },
    };
    const store = AlertStore.getInstance();
    store.attach(observer);
    return () => store.detach(observer);
  }, []);

  // === OBSERVER PATTERN: API services as Publishers ===
  // WeatherAlertService and EmergencyAlertService poll live APIs and publish
  // through AlertStore — the same Observer channel used by ICE reports.
  // Change '' to a two-letter US state code (e.g. 'TX') to filter by region.
  useEffect(() => {
    const weather = new WeatherAlertService('');
    const emergency = new EmergencyAlertService('');
    weather.start();
    emergency.start();
    return () => {
      weather.stop();
      emergency.stop();
    };
  }, []);

  const communityMap: Record<string, CommunityGroup> = {
    'African American': 'african-american',
    'Hispanic/Latino': 'hispanic-latino',
    'Asian American': 'asian-american',
    'Native American': 'native-american',
    'Pacific Islander': 'pacific-islander',
    'Muslim': 'muslim',
    'Sikh': 'sikh',
    'Buddhist': 'buddhist',
    'Jewish': 'jewish',
    'LGBTQ+': 'lgbtq',
    'Refugee/Asylum': 'refugee',
    'Immigrant': 'immigrant',
    'Disability': 'disability',
  };

  // === STRATEGY PATTERN: FilterContext chains interchangeable filter strategies ===
  // Adding or swapping a filter algorithm only requires a new FilterStrategy class.
  const filteredResources = useMemo(() => {
    if (selectedCategory === 'events') return [];

    const context = new FilterContext<Resource>();
    context.addStrategy(new CategoryFilterStrategy(selectedCategory));
    context.addStrategy(new CommunityFilterStrategy(selectedCommunities, communityMap));
    context.addStrategy(new SearchFilterStrategy(searchQuery));

    return context.executeAll(resources);
  }, [selectedCategory, selectedCommunities, searchQuery]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory !== 'events' && selectedCategory !== 'all') return [];

    return events.filter((event) => {
      const matchesCommunity = selectedCommunities.includes('all') ||
        (event.targetCommunities && event.targetCommunities.some(comm => {
          const lowerComm = comm.toLowerCase();
          return selectedCommunities.some(selectedComm => {
            const communityName = Object.keys(communityMap).find(
              key => communityMap[key] === selectedComm
            );
            return communityName && lowerComm.includes(communityName.toLowerCase());
          });
        }));

      const matchesSearch =
        searchQuery === '' ||
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCommunity && matchesSearch;
    });
  }, [selectedCategory, selectedCommunities, searchQuery]);

  const showResources = selectedCategory === 'all' || selectedCategory !== 'events';
  const showEvents = selectedCategory === 'all' || selectedCategory === 'events';

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleCommunityToggle = (community: CommunityGroup) => {
    setSelectedCommunities((prev) => {
      if (community === 'all') return ['all'];

      const filtered = prev.filter(c => c !== 'all');

      if (filtered.includes(community)) {
        const newSelection = filtered.filter(c => c !== community);
        return newSelection.length === 0 ? ['all'] : newSelection;
      } else {
        return [...filtered, community];
      }
    });
  };

  const handleClearCommunityFilters = () => {
    setSelectedCommunities(['all']);
  };

  // === OBSERVER PATTERN: Controller triggers the Subject (AlertStore) ===
  // AlertStore.publishICEReport() converts the report into an Alert and calls notifyObservers(),
  // which in turn calls update() on App (registered above), updating state reactively.
  const handleICEReportSubmit = (report: ICEReport) => {
    AlertStore.getInstance().publishICEReport(report);
    // UX: Visibility of System Status — confirm the submission to the user
    showToast('Report submitted. The community has been notified.', 'success');
  };

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: 'var(--background)' }}>
      {showRedCard && <RedCardViewer onClose={() => setShowRedCard(false)} />}
      {showICEReport && <ICEReportForm onClose={() => setShowICEReport(false)} onSubmit={handleICEReportSubmit} />}

      {/* UX: Visibility of System Status — toast stack */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Back to top button */}
      {showBackToTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className=" border-radius: 50% right-6 z-50 p-3 text-white rounded-full shadow-xl transition-all hover:scale-110 active:scale-95"
          style={{ backgroundColor: 'var(--primary)' }}
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}

      <header
        className="sticky top-0 z-40 shadow-sm"
        style={{ backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--header-border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl shadow-md" style={{ background: 'linear-gradient(135deg, var(--primary), var(--gold))' }}>
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Community Resources</h1>
                <p className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>Finding help, together — for all communities</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setShowSafeSpaces(!showSafeSpaces)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all shadow-sm"
                style={showSafeSpaces
                  ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
                  : { backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)' }
                }
              >
                <Shield size={18} />
                Safe Spaces
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alerts.length > 0 && (
          <section className="mb-8" aria-live="polite" aria-label="Active alerts">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="text-red-500" size={20} aria-hidden="true" />
              <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Active Alerts</h2>
              {/* UX: Visibility of System Status — count badge so users always know how many alerts exist */}
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: '#dc2626' }}
                aria-label={`${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}`}
              >
                {alerts.length}
              </span>
            </div>
            {alerts.map((alert) => (
              <AlertBanner key={alert.id} alert={alert} onDismiss={handleDismissAlert} />
            ))}
          </section>
        )}

        {/* Know Your Rights banner */}
        <div
          className="p-5 mb-6 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, var(--primary-light), var(--teal-light))',
            borderLeft: '4px solid var(--primary)',
          }}
        >
          <div className="flex items-start">
            <Info className="mr-3 mt-0.5 flex-shrink-0" size={20} style={{ color: 'var(--primary)' }} />
            <div className="flex-1">
              <p className="font-semibold mb-1 text-sm" style={{ color: 'var(--foreground)' }}>Know Your Rights</p>
              <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>
                You have the right to remain silent. You do not have to answer questions about your immigration
                status. You have the right to speak with a lawyer. Carry emergency contact information at all times.
              </p>
              <div className="flex flex-wrap gap-30">
                <button
                  onClick={() => setShowRedCard(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium shadow-sm hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  <FileText size={16} />
                  View/Print Rights Card
                </button>
                <button
                  onClick={() => setShowICEReport(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium shadow-sm hover:opacity-90 bg-red-600 text-white"
                >
                  <AlertIcon size={16} />
                  Report ICE Activity
                </button>
              </div>
            </div>
          </div>
        </div>

        {showSafeSpaces && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Safe Spaces Near You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {safeSpaces.map((space) => (
                <SafeSpaceCard key={space.id} space={space} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            {selectedCategory === 'events' ? 'Community Events' : 'Find Resources & Events'}
          </h2>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, description, community, or location..."
          />

          <CommunityFilter
            selectedCommunities={selectedCommunities}
            onCommunityToggle={handleCommunityToggle}
            onClearAll={handleClearCommunityFilters}
          />

          <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

          {showResources && filteredResources.length > 0 && (
            <>
              <div className="mb-4 text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Showing {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </>
          )}

          {showEvents && filteredEvents.length > 0 && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  {selectedCategory === 'events' ? 'All Events' : 'Upcoming Community Events'}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}

          {filteredResources.length === 0 && filteredEvents.length === 0 && (
            <div className="text-center py-16 rounded-xl" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <SearchX size={48} className="mx-auto mb-4" style={{ color: 'var(--foreground-muted)', opacity: 0.4 }} />
              <p className="text-lg font-medium mb-1" style={{ color: 'var(--foreground)' }}>No results found</p>
              <p className="text-sm mb-5" style={{ color: 'var(--foreground-muted)' }}>
                Try adjusting your search or filters to find what you need.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCommunities(['all']);
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl transition-all text-sm font-medium shadow-sm hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>

        <footer className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '2px solid #dc2626' }}>
            <h3 className="text-lg font-semibold text-red-600 mb-3">🚨 Emergency Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Catholic Charities OKC Immigration Legal', tel: '(405) 523-3001' },
                { label: 'OKC Crisis Intervention Center', tel: '(405) 522-8100' },
                { label: 'YWCA OKC Domestic Violence Hotline', tel: '(405) 917-9922' },
                { label: 'Diversity Center of Oklahoma (LGBTQ+)', tel: '(405) 604-5217' },
                { label: 'Suicide & Crisis Lifeline', tel: '988' },
                { label: 'DRS Oklahoma Disability Services', tel: '(800) 845-8476' },
              ].map(({ label, tel }) => (
                <div key={tel}>
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>{label}</p>
                  <a href={`tel:${tel}`} className="text-red-500 hover:text-red-400 font-semibold">{tel}</a>
                </div>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
