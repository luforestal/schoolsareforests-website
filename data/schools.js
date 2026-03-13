/**
 * Central school registry.
 * To add a new school: copy one entry, fill in the data, and add GPS coordinates.
 * The world map on the home page updates automatically from this file.
 */
export const schools = [
  {
    id: 'coocol',
    name: 'Cooley Ranch Elementary',
    location: 'Colton, CA, USA',
    country: 'USA',
    coordinates: [-117.29173912864394, 34.05235347377958],
    trees: 75,
    logo: 'https://luforestal.github.io/SchoolTreeMap/logos/coocol.png',
    pilot: true,
    pilotYear: 2025,
  },
  {
    id: 'rutcol',
    name: 'Ruth Grimes Elementary',
    location: 'Bloomington, CA, USA',
    country: 'USA',
    coordinates: [-117.38665961886166, 34.072121501045814],
    trees: 36,
    logo: 'https://luforestal.github.io/SchoolTreeMap/logos/rutcol.png',
    pilot: true,
    pilotYear: 2025,
  },
]
