import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'
import DailyRashiUpdates from './views/rashi/DailyRashiUpdates'
import Dashboard from './views/dashboard/Dashboard'
import FormSample from './FormSample'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    {/* <DailyRashiUpdates/> */}
    {/* <FormSample /> */}
    <App />
  </Provider>,
)
