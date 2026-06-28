export * from './configuration/api';
export * from './utils';

export * from './genre/api';
export * from './genre/schema';

export * from './movie/api';
export * from './movie/schema';
export { movieEndpoints } from './movie/endpoints';

export * from './tv/api';
export * from './tv/schema';
export { tvEndpoints } from './tv/endpoints';

export * from './person/api';
export * from './person/schema';
export { personEndpoints } from './person/endpoints';

export * from './discover/api';
export * from './discover/schema';
export { discoverEndpoints } from './discover/endpoints';

export * from './search/api';
export * from './search/person-media';
export * from './search/schema';
export { searchEndpoints } from './search/endpoints';
