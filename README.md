# IoT Mobility Sample

create .env file
```bash
# broker host
HOST=

# mqtt (1883), mqtts (8883)
PORT=8883

# SSL mqtts = 1, mqtt = 0
SSL=1

# topic prefix
TOPIC=

# interval ms
INTERVAL_MAX_MS=10000
INTERVAL_MIN_MS=3000

# client id max 23 characters
CLIENT_ID=

# id
USER_NAME=

# password
PASSWORD=

# total mobility count
TOTAL_CNT=5
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

To compile single file executable :

```bash
./build.sh
```


To run single file executable :

```bash
./iot-mobility-sample
```