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
INTERVAL=3000

# client id max 23 characters
CLIENT_ID=

# id
USER_NAME=

# password
PASSWORD=

# total mobility count
TOTAL_CNT=100
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.22. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
