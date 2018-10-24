import React from 'react'
import ReactDom from 'react-dom'
import {HashRouter as Router, Route} from "react-router-dom"

import App from "./App"

ReactDom.render(
    <Router>
        <Route path='/:channelName?' component={App} />
    </Router>,
    document.getElementById('app')
  );
