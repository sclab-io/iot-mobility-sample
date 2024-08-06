import mqtt, { type IClientOptions } from "mqtt";

// contants
const SEOUL_LAT_MIN = 37.55;
const SEOUL_LAT_MAX = 37.7;
const SEOUL_LNG_MIN = 126.8;
const SEOUL_LNG_MAX = 127.1;
const MOVE_DISTANCE_MIN = 0.0001;
const MOVE_DISTANCE_MAX = 0.001;
const TOPIC_PREFIX = process.env.TOPIC;
const INTERVAL_MS = process.env.INTERVAL
  ? parseInt(process.env.INTERVAL, 10)
  : 3000;
const OPTIONS: IClientOptions = {
  protocolVersion: 3,
  host: process.env.HOST || "localhost",
  port: (process.env.PORT ? parseInt(process.env.PORT, 10) : false) || 8883,
  protocol: process.env.SSL === "1" ? "mqtts" : "mqtt",
  reconnectPeriod: 10000,
  clientId: process.env.CLIENT_ID,
  username: process.env.USER_NAME,
  password: process.env.PASSWORD,
};
const COUNT: number = process.env.TOTAL_CNT
  ? parseInt(process.env.TOTAL_CNT, 10)
  : 2;

// mqtt client setup
const client = mqtt.connect(OPTIONS);

interface MobilityInfo {
  id: string;
  name: string;
  gps: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
}

class Mobility {
  info: MobilityInfo;
  movingRight: boolean;

  constructor(info: MobilityInfo, movingRight: boolean) {
    this.info = info;
    this.movingRight = movingRight;
  }

  updatePosition() {
    const moveDistance =
      MOVE_DISTANCE_MIN +
      Math.random() * (MOVE_DISTANCE_MAX - MOVE_DISTANCE_MIN);

    if (this.movingRight) {
      this.info.gps.lng += moveDistance;
      if (this.info.gps.lng >= SEOUL_LNG_MAX) {
        this.movingRight = false;
      }
    } else {
      this.info.gps.lng -= moveDistance;
      if (this.info.gps.lng <= SEOUL_LNG_MIN) {
        this.movingRight = true;
      }
    }
  }
}

class MobilityManager {
  totalCount: number;
  mobilities: Mobility[];
  isInited: boolean = false;

  constructor(totalCount: number) {
    this.totalCount = totalCount;
    this.mobilities = [];
  }

  init() {
    if (this.isInited) {
      return;
    }
    this.isInited = true;
    this.createMobilities();
    this.updatePositions();
    setInterval(() => this.updatePositions(), INTERVAL_MS);
  }

  createMobilities() {
    for (let i = 0; i < this.totalCount; i++) {
      const mobility = new Mobility(
        {
          id: `${i}`,
          name: `Mobility ${i}`,
          gps: this.getRandomLocation(),
          createdAt: new Date(),
        },
        Math.random() >= 0.5
      );
      this.mobilities.push(mobility);
    }
  }

  getRandomLocation() {
    const lat = SEOUL_LAT_MIN + Math.random() * (SEOUL_LAT_MAX - SEOUL_LAT_MIN);
    const lng = SEOUL_LNG_MIN + Math.random() * (SEOUL_LNG_MAX - SEOUL_LNG_MIN);

    return { lat, lng };
  }

  updatePositions() {
    this.mobilities.forEach((mobility) => {
      mobility.updatePosition();
      const data = JSON.stringify(mobility.info);
      client.publish(TOPIC_PREFIX + "/" + mobility.info.id, data, (err) => {
        if (err) {
          console.error(
            `Failed to publish message for ${mobility.info.id}`,
            err
          );
        } else {
          console.log(`Message published for ${mobility.info.id} : ${data}`);
        }
      });
    });
  }
}

const manager = new MobilityManager(COUNT);
client.on("connect", () => {
  console.log("Connection complete");
  manager.init();
});

client.on("error", (err) => {
  console.error("Connection error: ", err);
});

client.on("reconnect", () => {
  console.log("Reconnecting to MQTT broker...");
});

client.on("offline", () => {
  console.log("MQTT broker is offline");
});
