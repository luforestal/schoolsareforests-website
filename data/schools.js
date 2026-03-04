/**
 * Central school registry.
 * To add a new school: copy one entry, fill in the data, and add GPS coordinates.
 * The world map on the home page updates automatically from this file.
 */
export const schools = [
  {
    id: 'wildav',
    name: 'Robert E. Willett Elementary',
    location: 'Davis, CA, USA',
    country: 'USA',
    coordinates: [-121.7405, 38.5449],
    trees: 90,
    logo: 'https://luforestal.github.io/SchoolTreeMap/logos/wildav.png',
  },
  {
    id: 'coocol',
    name: 'Cooley Ranch Elementary',
    location: 'Colton, CA, USA',
    country: 'USA',
    coordinates: [-117.3131, 34.0739],
    trees: 75,
    logo: 'https://luforestal.github.io/SchoolTreeMap/logos/coocol.png',
  },
  {
    id: 'rutcol',
    name: 'Ruth Grimes Elementary',
    location: 'Bloomington, CA, USA',
    country: 'USA',
    coordinates: [-117.3964, 34.0653],
    trees: 36,
    logo: 'https://luforestal.github.io/SchoolTreeMap/logos/rutcol.png',
  },
]
