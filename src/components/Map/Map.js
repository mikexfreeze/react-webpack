import { Map } from 'react-amap';

export default class ACMap extends Map {
  render() {
    return (
      <Map
        amapkey={"ff33601a9d1455b2f3478b6a46d9a2c9"}
        {...this.props}
      />
    );
  }
}

