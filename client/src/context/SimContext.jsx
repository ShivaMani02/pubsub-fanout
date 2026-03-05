// SimContext.jsx - React Context for global simulation state
// Provides simulation state management across all components

import { createContext } from 'react';

const SimContext = createContext({
  simState: {},
  setSimState: () => {}
});

export default SimContext;
