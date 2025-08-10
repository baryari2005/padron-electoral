import { EventEmitter } from "events";

const emitters = new Map<string, EventEmitter>();

function getEmitter(mesaId: string) {
  let ee = emitters.get(mesaId);
  if (!ee) {
    ee = new EventEmitter();
    emitters.set(mesaId, ee);
  }
  return ee;
}

export function addListener(mesaId: string, cb: (data: any) => void) {
  getEmitter(mesaId).on("message", cb);
}

export function removeListener(mesaId: string, cb: (data: any) => void) {
  const ee = emitters.get(mesaId);
  if (ee) ee.off("message", cb);
}

export function emitVoteChange(mesaId: string, data: any) {
  const ee = getEmitter(mesaId);
  ee.emit("message", data);
}
