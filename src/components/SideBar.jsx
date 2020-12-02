import React from 'react'
import {
  // Checkbox,
  Grid,
  Icon,
  Menu,
  Segment,
  Sidebar,
} from 'semantic-ui-react'
import MapContainer from "./Map/MapContainer";

const SideBar = () => {
  const [visible, setVisible] = React.useState(false)

  return (
    <Grid columns={1}>
      {/* <Grid.Column>
        <Checkbox
          checked={visible}
          label={{ children: <code>visible</code> }}
          onChange={(e, data) => setVisible(data.checked)}
        />
      </Grid.Column> */}

      <Grid.Column>
        <Sidebar.Pushable as={Segment}>
          <Sidebar animation='push'
            as={Menu}
            icon='labeled'
            inverted
            onHide={() => setVisible(false)}
            vertical
            visible={true}
            width='thin'
          >
            <Menu.Item as='a'>
              <Icon name='home' />
              Home
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='gamepad' />
              Street View Detection
            </Menu.Item>
            <Menu.Item as='a'>
              <Icon name='camera' />
              Real Image Detection
            </Menu.Item>
          </Sidebar>

          <Sidebar.Pusher dimmed={visible}>
            <Segment basic>
                <div>
                <MapContainer/>
                </div>

            </Segment>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </Grid.Column>
    </Grid>
  )
}

export default SideBar
