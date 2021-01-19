import React from 'react'
import { Grid, Icon, Menu, Segment, Sidebar } from 'semantic-ui-react'
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import MapStreetView from "./Map/MapStreetView.jsx"
import File from "./UserUpload/File.js"
import Map311 from "./Map/Map311.jsx"
import VirtualTour from "./Virtual Tour/VirtualTour.jsx"
import NotFound from "./NotFound/NotFound.jsx"
import MapCluster from "./Map/MapCluster.jsx"
import MapClusterNBH from "./Map/MapClusterNBH.jsx"
import Visualization311 from "./Visualization311/Visualization311.jsx"
import Chatbot from './ChatBot/Chatbot.jsx';

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
    } else if (window.location.pathname === "/blockgroups") {
      this.setState({
        currentView: 4
      })
      
    } else if (window.location.pathname === "/neighborhoods") {
      this.setState({
        currentView: 5
      })
    } else if (window.location.pathname === "/visualization311") {
      this.setState({
        currentView: 6
      })
    } else if (window.location.pathname === "/chatbot") {
      this.setState({
        currentView: 7
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
                <Link to="/blockgroups">
                  <Menu.Item
                    name="Block Group Cluster"
                    onClick={this.handleMenuSelect.bind(this, 4)}
                    active={currentView === 4}
                  >
                    <Icon name="connectdevelop" />
                    Block Groups
                  </Menu.Item>
                </Link>
                <Link to="/neighborhoods">
                  <Menu.Item
                    name="Neighborhood Cluster"
                    onClick={this.handleMenuSelect.bind(this, 5)}
                    active={currentView === 5}
                  >
                    <Icon name="connectdevelop" />
                    Neighborhoods
                  </Menu.Item>
                </Link>
                <Link to="/visualization311">
                  <Menu.Item
                    name="Visualization 311"
                    onClick={this.handleMenuSelect.bind(this, 6)}
                    active={currentView === 6}
                  >
                    <Icon name="chart bar" />
                    Visualization 311
                  </Menu.Item>
                </Link>
                <Link to="/chatbot">
                  <Menu.Item
                    name="Chatbot"
                    onClick={this.handleMenuSelect.bind(this, 7)}
                    active={currentView === 7}
                  >
                    <Icon name="comment alternate outline" />
                    Chatbot
                  </Menu.Item>
                </Link>
              </Sidebar>

              <Switch>
                <Route exact path="/" component={MapStreetView} />
                <Route exact path="/streetViewDetect" component={MapStreetView} />
                <Route exact path="/realImageDetect" component={File} />
                <Route exact path="/call311" component={Map311} />
                <Route exact path="/virtualTour" component={VirtualTour} />
                <Route exact path="/blockgroups" component={MapCluster} />
                <Route exact path="/neighborhoods" component={MapClusterNBH} />
                <Route exact path="/visualization311" component={Visualization311} />
                <Route exact path="/chatbot" component={Chatbot} />
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