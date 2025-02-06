import { Wrapper } from '../dist/Wrapper.js';
import { config } from 'dotenv';
config({ path: 'tests/api.env' });

async function main() {
  const wrapper = new Wrapper(process.env.API_KEY);
  const account = await wrapper.account;
  const server = await wrapper.server;
  let testServer = 'e1327170-a4fe-4577-8549-47f872772e98';

  await server.getServerByUUID(testServer).then(async (svr) => {
    let obj = await svr.files.deleteFiles(['test.txt'], '/', true);
    console.log(obj);
  });
}

main();
