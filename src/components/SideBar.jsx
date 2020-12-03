import React from 'react'
import { Grid, Icon, Menu, Segment, Sidebar } from 'semantic-ui-react'

import MapContainer from "./Map/MapContainer.jsx"
import File from "./UserUpload/File.js"
import Map311 from "./Map/Map311.jsx"

export default class SideBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentView: 0
    }
  }

  handleMenuSelect(option) {
    this.setState({
      currentView: option
    })
  }

  render() {
    const currentView = this.state.currentView;

    var view = <MapContainer/>;
    if (currentView == 0) {
      view = <MapContainer/>
    } else if (currentView == 1) {
      view = <File/>
    } else {
      view = <Map311/>
    }

    return (
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
              <Menu.Item
                name="Street View Detection"
                onClick={this.handleMenuSelect.bind(this, 0)}
                active={currentView === 0}
              >
                <Icon name="street view" />
                Street View Detection
              </Menu.Item>
              <Menu.Item
                name="Real Image Detection"
                onClick={this.handleMenuSelect.bind(this, 1)}
                active={currentView === 1}
              >
                <Icon name="road" />
                Real Image Detection
              </Menu.Item>
              <Menu.Item
                name="311 Call"
                onClick={this.handleMenuSelect.bind(this, 2)}
                active={currentView === 2}
              >
                <Icon name="call" />
                311 Call
              </Menu.Item>
            </Sidebar>

            <Sidebar.Pusher>
              <Segment basic>
                {view}
              </Segment>
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </Grid.Column>
      </Grid>
    )
  }
}