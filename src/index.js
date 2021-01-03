const MQTT = require("async-mqtt");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const os = require("os");

const argv = yargs(hideBin(process.argv)).argv;
const hostname = os.hostname();
const state_topic = `winLock2mqtt/${hostname}/lock_status/`;
const command_topic = `winLock2mqtt/${hostname}/lock_status/set`;
const config_topic = `homeassistant/lock/${hostname}/lock_status/config`;

const status = argv.status;
const host = argv.host;
const port = argv.port;
const protocol = argv.protocol;
const username = argv.username;
const password = argv.password;

const run = async () => {
  const client = await MQTT.connectAsync({
    host,
    port,
    protocol,
    username,
    password,
  });

  try {
    const config = {
      name: `${hostname}_lock`,
      state_topic,
      command_topic,
      payload_lock: "LOCK",
      payload_unlock: "UNLOCK",
      state_locked: "LOCK",
      state_unlocked: "UNLOCK",
      optimistic: false,
      qos: 1,
      retain: true,
      value_template: "{{ value }}",
    };

    await client.publish(config_topic, JSON.stringify(config));

    console.log(`publishing: ${status}`);
    await client.publish(state_topic, status);
  } catch (ex) {
    console.log(e.stack);
    process.exit();
  } finally {
    if (client.connected) {
      await client.end();
    }
  }
};

run();
