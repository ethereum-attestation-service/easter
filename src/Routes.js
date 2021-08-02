import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import App from "./App";
import AddressPage from "./AddressPage";

function Routes() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={App} />
        <Route exact path="/address/:address" component={AddressPage} />
      </Switch>
    </Router>
  );
}

export default Routes;
