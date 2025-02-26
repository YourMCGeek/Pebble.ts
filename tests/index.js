import { Wrapper } from '../dist/Wrapper.js';
import { config } from 'dotenv';
config({ path: 'tests/api.env' });

async function main() {
  const wrapper = new Wrapper(process.env.API_KEY);
  const account = wrapper.account;
  const server = wrapper.server;
  let testServer = 'e1327170-a4fe-4577-8549-47f872772e98';
  // let fakeServer = 'aee488e3-de40-4941-b952-95c3180d8bc2';

  // await server.getServerByUUID(testServer).then(async (svr) => {
  //   let obj = await svr.adp.getCountryFirewallRules();
  //   console.log(obj);
  // });

  await server.getServerByUUID(testServer).then(async (svr) => {
    let obj = await svr.minecraft.installModpack('modrinth', 'l9m9tuPN', '2.1', true);
    console.log(obj);
  });
}

main();
