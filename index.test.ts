import { beforeEach, describe, expect, test } from "bun:test";
import {
  Mobility,
  MobilityManager,
  SEOUL_LAT_MAX,
  SEOUL_LAT_MIN,
  SEOUL_LNG_MAX,
  SEOUL_LNG_MIN,
  type MobilityInfo,
} from ".";

describe("Mobility", () => {
  let mobility: Mobility;
  let info: MobilityInfo;

  beforeEach(() => {
    info = {
      id: "id1",
      name: "Mobility 1",
      lat: 37.6,
      lng: 126.9,
      createdAt: new Date(),
    };
    mobility = new Mobility({ ...info }, true);
  });

  test("should update position correctly when moving right", () => {
    mobility.updatePosition();
    expect(mobility.info.lng).toBeGreaterThan(info.lng);
    expect(mobility.movingRight).toBeTrue();
  });

  test("should update position correctly when moving left", () => {
    mobility.movingRight = false;
    mobility.updatePosition();
    expect(mobility.info.lng).toBeLessThan(info.lng);
    expect(mobility.movingRight).toBeFalse();
  });

  test("should send data correctly", () => {
    let publishCalled = false;
    const expectedData = JSON.stringify(info);

    mobility.sendData = () => {
      publishCalled = true;
    };

    mobility.sendData();

    expect(publishCalled).toBeTrue();
    expect(mobility.info).toEqual(info);
  });

  test("should initialize MobilityManager correctly", () => {
    const totalCount = 5;
    const manager = new MobilityManager(totalCount);

    expect(manager.totalCount).toBe(totalCount);
    expect(manager.mobilities.length).toBe(0);
    expect(manager.isInited).toBeFalse();
  });

  test("should initialize MobilityManager and create mobilities correctly", () => {
    const totalCount = 3;
    const manager = new MobilityManager(totalCount);
    manager.init();

    expect(manager.isInited).toBeTrue();
    expect(manager.mobilities.length).toBe(totalCount);

    manager.mobilities.forEach((mobility) => {
      expect(mobility).toBeInstanceOf(Mobility);
    });
  });

  test("should generate random location within Seoul boundaries", () => {
    const manager = new MobilityManager(1);
    const location = manager.getRandomLocation();

    expect(location.lat).toBeGreaterThanOrEqual(SEOUL_LAT_MIN);
    expect(location.lat).toBeLessThanOrEqual(SEOUL_LAT_MAX);
    expect(location.lng).toBeGreaterThanOrEqual(SEOUL_LNG_MIN);
    expect(location.lng).toBeLessThanOrEqual(SEOUL_LNG_MAX);
  });
});
