import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateCondition,
  interpolateTemplate,
  runWorkflow,
} from "../src/workflowEngine.js";
import {
  buildOpenMeteoUrl,
  isRainyWeather,
  normalizeWeather,
} from "../src/weather.js";

test("buildOpenMeteoUrl includes coordinates, current weather fields, and timezone", () => {
  const url = buildOpenMeteoUrl({
    latitude: 32.0603,
    longitude: 118.7969,
    timezone: "Asia/Shanghai",
  });

  assert.equal(url.origin, "https://api.open-meteo.com");
  assert.equal(url.pathname, "/v1/forecast");
  assert.equal(url.searchParams.get("latitude"), "32.0603");
  assert.equal(url.searchParams.get("longitude"), "118.7969");
  assert.equal(
    url.searchParams.get("current"),
    "temperature_2m,rain,precipitation,weather_code",
  );
  assert.equal(url.searchParams.get("timezone"), "Asia/Shanghai");
});

test("normalizeWeather returns a stable weather summary", () => {
  const summary = normalizeWeather({
    current: {
      temperature_2m: 21.4,
      rain: 0.3,
      precipitation: 0.7,
      weather_code: 61,
      time: "2026-05-28T08:00",
    },
    current_units: {
      temperature_2m: "°C",
      rain: "mm",
      precipitation: "mm",
    },
  });

  assert.deepEqual(summary, {
    temperature: 21.4,
    temperatureUnit: "°C",
    rain: 0.3,
    rainUnit: "mm",
    precipitation: 0.7,
    precipitationUnit: "mm",
    weatherCode: 61,
    time: "2026-05-28T08:00",
    rainy: true,
  });
});

test("isRainyWeather treats rain or precipitation above zero as rainy", () => {
  assert.equal(isRainyWeather({ rain: 0, precipitation: 0 }), false);
  assert.equal(isRainyWeather({ rain: 0.1, precipitation: 0 }), true);
  assert.equal(isRainyWeather({ rain: 0, precipitation: 0.2 }), true);
});

test("interpolateTemplate replaces nested context values", () => {
  const text = interpolateTemplate(
    "{{city.name}} is {{weather.temperature}}{{weather.temperatureUnit}}",
    {
      city: { name: "Nanjing" },
      weather: { temperature: 22, temperatureUnit: "°C" },
    },
  );

  assert.equal(text, "Nanjing is 22°C");
});

test("evaluateCondition supports numeric comparisons against nested values", () => {
  const context = { weather: { rain: 0.4, rainy: true } };

  assert.equal(
    evaluateCondition({ left: "weather.rain", operator: ">", right: 0 }, context),
    true,
  );
  assert.equal(
    evaluateCondition(
      { left: "weather.rain", operator: "===", right: 0 },
      context,
    ),
    false,
  );
  assert.equal(
    evaluateCondition(
      { left: "weather.rainy", operator: "===", right: true },
      context,
    ),
    true,
  );
});

test("runWorkflow passes outputs between nodes and only runs true-branch actions", async () => {
  const events = [];
  const workflow = [
    {
      id: "trigger",
      type: "manualTrigger",
      label: "Button Trigger",
    },
    {
      id: "weather",
      type: "weatherApi",
      label: "Get Weather",
      config: { cityId: "nanjing" },
    },
    {
      id: "ifRain",
      type: "condition",
      label: "If Rain",
      config: {
        condition: { left: "weather.rainy", operator: "===", right: true },
      },
    },
    {
      id: "notify",
      type: "notify",
      label: "Notify",
      config: {
        when: "ifRain",
        message: "{{city.name}} has rain. Bring an umbrella.",
      },
    },
  ];

  const result = await runWorkflow(workflow, {
    initialContext: {
      city: { id: "nanjing", name: "Nanjing" },
    },
    services: {
      fetchWeather: async () => ({
        temperature: 19,
        temperatureUnit: "°C",
        rain: 0.6,
        rainUnit: "mm",
        precipitation: 0.6,
        precipitationUnit: "mm",
        weatherCode: 61,
        time: "2026-05-28T08:00",
        rainy: true,
      }),
      notify: async (message) => events.push(message),
    },
  });

  assert.equal(result.context.weather.rainy, true);
  assert.deepEqual(events, ["Nanjing has rain. Bring an umbrella."]);
  assert.deepEqual(
    result.logs.map((log) => [log.nodeId, log.status]),
    [
      ["trigger", "success"],
      ["weather", "success"],
      ["ifRain", "success"],
      ["notify", "success"],
    ],
  );
});
