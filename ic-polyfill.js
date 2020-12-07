import {
  generateKeyPair,
  HttpAgent,
  Principal,
  makeNonceTransform,
  makeAuthTransform,
  makeExpiryTransform,
  Actor,
  makeActorFactory
} from '@dfinity/agent';

const keyPair = generateKeyPair();
const agent = new HttpAgent({
  principal: Principal.selfAuthenticating(keyPair.publicKey),
});
agent.addTransform(makeExpiryTransform(5 * 60 * 1000));
agent.addTransform(makeNonceTransform());
agent.setAuthTransform(makeAuthTransform(keyPair));

const ic = { Actor, makeActorFactory, agent };
globalThis.ic = ic;

export { ic };
