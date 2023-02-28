import { get } from 'lodash'
import axios from 'axios'

async function trafficApi(url: string): Promise<string> {
  const res = await axios.get(url).then(response => response.data)
  const trafficMsg = get(res, 'description').replace(/,/g, '，')

  return trafficMsg
}

export async function suzhouTrafficApi() {
  return trafficApi(
    'http://api.map.baidu.com/traffic/v1/around?ak=YNRsmwTVsGzSjdDeM1cgx7HEhW5UG7j0&center=31.266153114718705,120.74027468510906&radius=1000&coord_type_input=gcj02&coord_type_output=gcj02'
  )
}

export async function shanghaiTrafficApi() {
  return trafficApi(
    'http://api.map.baidu.com/traffic/v1/around?ak=YNRsmwTVsGzSjdDeM1cgx7HEhW5UG7j0&center=31.258153252168494,121.46439447458258&radius=1000&coord_type_input=gcj02&coord_type_output=gcj02'
  )
}

export async function beijingTrafficApi() {
  return trafficApi(
    'http://api.map.baidu.com/traffic/v1/around?ak=YNRsmwTVsGzSjdDeM1cgx7HEhW5UG7j0&center=39.925197645957404,116.44208675176043&radius=1000&coord_type_input=gcj02&coord_type_output=gcj02'
  )
}
