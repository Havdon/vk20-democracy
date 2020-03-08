

export const DRAW_CLUSTER_RADI = false;
export const DRAW_SEATS = false;
export const ONLY_CIRCLES = true;
export const SOLID_SHAPES = true;
export const VARIABLE_COLOR = false;
export const CLUSTER_RANDOMLY = true;
export const FORM_PARLIAMENT = false;

export const CANVAS_OPACITY = VARIABLE_COLOR ? 0.7 : 1.0;

export const POPULATION_SIZE = 100;
export const CITIZENS_PER_REP = 10;
export const PARTY_MAX_SIZE = 0.4;

// Number of opinions that citizens have
export const OPINION_COUNT = 5;

// How close to the window edges citizens can spawn
export const BORDER_PADDING = 10;

// Radius of the inner circle of the parliament formation.
export const PARLIAMENT_RADIUS = 80;

// Multiplier for spacing between seats
export const PARLIAMENT_SPACING = 1.2;

// Number of clusters
export const MIN_CLUSTERS = 7;
export const MAX_CLUSTERS = 12;

// Radius of a citizen
export const CITIZEN_RADIUS = 5;

// Let's keep a respectable distance between citizens.
export const CITIZEN_PADDING = 5;

// How much bigger an elected official is
export const ELECTED_RADIUS_MULTIPLIER = 1;

// Seconds it takes to grow when elected.
export const ELECTION_PROCESS_LENGTH = 0.5; 

// Seconds between elections
export const TIME_BETWEEN_ELECTIONS = 12;

// Percentage of a cluster that have to be at rest to allow for elections.
export const MIN_ELECTORATE_SIZE = 0.7;

// Max speed anyone can move.
export const SPEED_LIMIT = 0.01;

export const AIR_FRICTION = 0.8;

// Number of velocity reading stored for sleep detection.
export const VELOCITY_HISTORY_LENGTH = 10;

// Avg velocity over history has to be below this for a citizen to be asleep.
export const STILLNESS_LIMIT = 0.01;

// Distance from edge of canvas where fadein happens.
export const FADE_DISTANCE = 20;