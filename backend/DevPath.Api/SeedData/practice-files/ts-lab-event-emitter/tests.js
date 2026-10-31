test('Handlers receive the payload in order', () => { const e = new Emitter(); const seen = []; e.on('saved', p => seen.push('a' + p.id)); e.on('saved', p => seen.push('b' + p.id)); e.emit('saved', { id: 1 }); expect(seen).toEqual(['a1', 'b1']); });
test('once runs a single time', () => { const e = new Emitter(); let n = 0; e.once('x', () => n++); e.emit('x', 1); e.emit('x', 1); expect(n).toBe(1); });
test('Unsubscribe works', () => { const e = new Emitter(); let n = 0; const stop = e.on('x', () => n++); stop(); e.emit('x', 1); expect(n).toBe(0); });
test('A failing handler does not stop the others', () => { const e = new Emitter(); let n = 0; e.on('x', () => { throw new Error('boom'); }); e.on('x', () => n++); e.emit('x', 1); expect(n).toBe(1); });
