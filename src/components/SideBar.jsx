import React from 'react'
import { Grid, Icon, Menu, Segment, Sidebar } from 'semantic-ui-react'
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import MapStreetView from "./Map/MapStreetView.jsx"
import File from "./UserUpload/File.js"
import Map311 from "./Map/Map311.jsx"
import VirtualTour from "./Virtual Tour/VirtualTour.jsx"
import NotFound from "./NotFound/NotFound.jsx"
import MapCluster from "./Map/MapCluster.jsx"

export default class SideBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentView: 0
    }
  }

  componentDidMount() {
    if (window.location.pathname === "/realImageDetect") {
      this.setState({
        currentView: 1
      })
    } else if (window.location.pathname === "/call311") {
      this.setState({
        currentView: 2
      })
    } else if (window.location.pathname === "/virtualTour") {
      this.setState({
        currentView: 3
      })
    } else if (window.location.pathname === "/neighborhoods") {
      this.setState({
        currentView: 4
      })
    } else { //Default to 0
      this.setState({
        currentView: 0
      })
    }
  }

  handleMenuSelect(option) {
    this.setState({
      currentView: option
    })
  }

  render() {
    const currentView = this.state.currentView;

    // var view = <MapStreetView/>;
    // if (currentView === 0) {
    //   view = <MapStreetView/>
    // } else if (currentView === 1) {
    //   view = <File/>
    // } else if (currentView === 2) {
    //   view = <Map311/>
    // } else {
    //   view = <VirtualTour/>
    // }

    return (
      <Router>
        <Grid columns={1}>
          <Grid.Column>
            <Sidebar.Pushable as={Segment}>
              <Sidebar
                animation='push'
                as={Menu}
                icon='labeled'
                inverted
                vertical
                visible={true}
                width='thin'
              >
                <Link to="/streetViewDetect">
                  <Menu.Item
                    name="Street View Detection"
                    onClick={this.handleMenuSelect.bind(this, 0)}
                    active={currentView === 0}
                  >
                    <Icon name="street view" />
                    Street View Detection
                  </Menu.Item>
                </Link>
                <Link to="/realImageDetect">
                  <Menu.Item
                    name="Real Image Detection"
                    onClick={this.handleMenuSelect.bind(this, 1)}
                    active={currentView === 1}
                  >
                    <Icon name="road" />
                    Real Image Detection
                  </Menu.Item>
                </Link>
                <Link to="/call311">
                  <Menu.Item
                    name="311 Call"
                    onClick={this.handleMenuSelect.bind(this, 2)}
                    active={currentView === 2}
                  >
                    <Icon name="call" />
                    311 Call
                  </Menu.Item>
                </Link>
                <Link to="/virtualTour">
                  <Menu.Item
                    name="Virtual Tour"
                    onClick={this.handleMenuSelect.bind(this, 3)}
                    active={currentView === 3}
                  >
                    <Icon name="magnify" />
                    Virtual Tour
                  </Menu.Item>
                </Link>
                <Link to="/neighborhoods">
                  <Menu.Item
                    name="Neighborhood Cluster"
                    onClick={this.handleMenuSelect.bind(this, 4)}
                    active={currentView === 4}
                  >
                    <Icon name="connectdevelop" />
                    Neighborhoods
                  </Menu.Item>
                </Link>
              </Sidebar>

              <Switch>
                <Route exact path="/" component={MapStreetView} />
                <Route exact path="/streetViewDetect" component={MapStreetView} />
                <Route exact path="/realImageDetect" component={File} />
                <Route exact path="/call311" component={Map311} />
                <Route exact path="/virtualTour" component={VirtualTour} />
                <Route exact path="/neighborhoods" component={MapCluster} />
                <Route component={NotFound} />
              </Switch>

              {/* <Sidebar.Pusher>
                <Segment basic>
                  {view}
                </Segment>
              </Sidebar.Pusher> */}
            </Sidebar.Pushable>
          </Grid.Column>
        </Grid>
      </Router>
    )
  }
}