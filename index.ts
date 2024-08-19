import mqtt, { type IClientOptions } from "mqtt";

// contants
export const SEOUL_LAT_MIN = 37.55;
export const SEOUL_LAT_MAX = 37.7;
export const SEOUL_LNG_MIN = 126.8;
export const SEOUL_LNG_MAX = 127.1;
export const MOVE_DISTANCE_MIN = 0.0001;
export const MOVE_DISTANCE_MAX = 0.001;
export const TOPIC = process.env.TOPIC || "";
export const INTERVAL_MAX_MS = process.env.INTERVAL_MAX_MS
  ? parseInt(process.env.INTERVAL_MAX_MS, 10)
  : 3000;
export const INTERVAL_MIN_MS = process.env.INTERVAL_MIN_MS
  ? parseInt(process.env.INTERVAL_MIN_MS, 10)
  : 1000;
export const OPTIONS: IClientOptions = {
  protocolVersion: 3,
  host: process.env.HOST || "localhost",
  port: (process.env.PORT ? parseInt(process.env.PORT, 10) : false) || 8883,
  protocol: process.env.SSL === "1" ? "mqtts" : "mqtt",
  reconnectPeriod: 10000,
  clientId: process.env.CLIENT_ID,
  username: process.env.USER_NAME,
  password: process.env.PASSWORD,
};

if (
  OPTIONS.host?.startsWith("mqtts://") ||
  OPTIONS.host?.startsWith("mqtt://")
) {
  OPTIONS.host = OPTIONS.host.replace("mqtts://", "").replace("mqtt://", "");
}

export const COUNT: number = process.env.TOTAL_CNT
  ? parseInt(process.env.TOTAL_CNT, 10)
  : 2;

// mqtt client setup
const client = mqtt.connect(OPTIONS);

export interface MobilityInfo {
  id: string;
  name: string;
  lat: number;
  lng: number;
  createdAt: Date;
}

export class Mobility {
  info: MobilityInfo;
  movingRight: boolean;

  constructor(info: MobilityInfo, movingRight: boolean) {
    this.info = info;
    this.movingRight = movingRight;
    this.run();
  }

  run() {
    let interval = INTERVAL_MAX_MS * Math.random();
    if (interval < INTERVAL_MIN_MS) {
      interval = INTERVAL_MIN_MS;
    }
    setTimeout(() => {
      this.updatePosition();
      this.sendData();
    }, interval);
  }

  sendData() {
    const data = JSON.stringify(this.info);
    client.publish(TOPIC + "/" + this.info.id, data, (err) => {
      if (err) {
        console.error(`Failed to publish message for ${TOPIC}`, err);
      } else {
        console.log(`Message published for ${TOPIC} : ${data}`);
      }

      this.run();
    });
  }

  updatePosition() {
    const moveDistance =
      MOVE_DISTANCE_MIN +
      Math.random() * (MOVE_DISTANCE_MAX - MOVE_DISTANCE_MIN);

    if (this.movingRight) {
      this.info.lng += moveDistance;
      if (this.info.lng >= SEOUL_LNG_MAX) {
        this.movingRight = false;
      }
    } else {
      this.info.lng -= moveDistance;
      if (this.info.lng <= SEOUL_LNG_MIN) {
        this.movingRight = true;
      }
    }
  }
}

export class MobilityManager {
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
  }

  createMobilities() {
    for (let i = 0; i < this.totalCount; i++) {
      const { lat, lng } = this.getRandomLocation();
      const mobility = new Mobility(
        {
          id: `id${i}`,
          name: `Mobility ${i}`,
          lat,
          lng,
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
