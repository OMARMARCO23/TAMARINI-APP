import { MathTopic } from '@/types';

export const MATH_TOPICS: Record<MathTopic, {
  name: string;
  icon: string;
  description: string;
  subTopics: string[];
}> = {
  arithmetic: {
    name: 'Arithmetic',
    icon: '🔢',
    description: 'Basic operations, fractions, decimals, percentages',
    subTopics: [
      'Addition & Subtraction',
      'Multiplication & Division',
      'Fractions',
      'Decimals',
      'Percentages',
      'Order of Operations',
      'Ratios & Proportions',
    ],
  },
  algebra: {
    name: 'Algebra',
    icon: '📐',
    description: 'Equations, expressions, functions',
    subTopics: [
      'Linear Equations',
      'Quadratic Equations',
      'Polynomials',
      'Factoring',
      'Systems of Equations',
      'Inequalities',
      'Functions',
      'Exponents & Logarithms',
    ],
  },
  geometry: {
    name: 'Geometry',
    icon: '📏',
    description: 'Shapes, areas, volumes, angles',
    subTopics: [
      'Angles',
      'Triangles',
      'Circles',
      'Polygons',
      'Area & Perimeter',
      'Volume & Surface Area',
      'Coordinate Geometry',
      'Transformations',
    ],
  },
  trigonometry: {
    name: 'Trigonometry',
    icon: '📊',
    description: 'Trigonometric functions and identities',
    subTopics: [
      'Basic Ratios (sin, cos, tan)',
      'Unit Circle',
      'Trigonometric Identities',
      'Solving Triangles',
      'Graphs of Trig Functions',
      'Inverse Trig Functions',
    ],
  },
  calculus: {
    name: 'Calculus',
    icon: '∫',
    description: 'Derivatives, integrals, limits',
    subTopics: [
      'Limits',
      'Derivatives',
      'Chain Rule',
      'Product & Quotient Rules',
      'Integrals',
      'Integration Techniques',
      'Applications of Derivatives',
      'Applications of Integrals',
    ],
  },
  statistics: {
    name: 'Statistics',
    icon: '📈',
    description: 'Probability, data analysis',
    subTopics: [
      'Mean, Median, Mode',
      'Standard Deviation',
      'Probability',
      'Combinations & Permutations',
      'Normal Distribution',
      'Data Visualization',
    ],
  },
  'number-theory': {
    name: 'Number Theory',
    icon: '🔣',
    description: 'Primes, divisibility, modular arithmetic',
    subTopics: [
      'Prime Numbers',
      'Divisibility',
      'GCD & LCM',
      'Modular Arithmetic',
      'Number Patterns',
    ],
  },
  'linear-algebra': {
    name: 'Linear Algebra',
    icon: '🔲',
    description: 'Matrices, vectors, linear transformations',
    subTopics: [
      'Vectors',
      'Matrices',
      'Matrix Operations',
      'Determinants',
      'Eigenvalues',
      'Linear Transformations',
    ],
  },
};

export const TOPIC_COLORS: Record<MathTopic, string> = {
  arithmetic: 'bg-green-500',
  algebra: 'bg-blue-500',
  geometry: 'bg-purple-500',
  trigonometry: 'bg-orange-500',
  calculus: 'bg-red-500',
  statistics: 'bg-teal-500',
  'number-theory': 'bg-yellow-500',
  'linear-algebra': 'bg-pink-500',
};
