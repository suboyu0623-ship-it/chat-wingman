const { createWorker } = require('tesseract.js');
const path = 'C:/Users/Lenovo/.openclaw/media/inbound/73b48e81ce5e56280aeb22b7588cbbc3---2461a412-e6e1-496d-a5c6-c72a2697c8fd.jpg';

(async () => {
  const worker = await createWorker('chi_sim+eng');
  const { data } = await worker.recognize(path);
  
  console.log('=== IMAGE SIZE ===');
  // Get image size from first word's bbox extent
  let maxX = 0, maxY = 0;
  (data.lines || data.words || []).forEach(l => {
    if (l.bbox && l.bbox.x1 > maxX) maxX = l.bbox.x1;
    if (l.bbox && l.bbox.y1 > maxY) maxY = l.bbox.y1;
  });
  console.log(`Text extent: ${maxX}x${maxY}`);
  console.log(`Cutoffs: top=${(maxY*0.07).toFixed(0)} header=${(maxY*0.18).toFixed(0)} bottom=${(maxY*0.84).toFixed(0)}`);
  
  console.log('\n=== LINES WITH POSITIONS ===');
  const lines = data.lines || [];
  lines.forEach(l => {
    if (!l.bbox || !l.text || l.text.trim().length === 0) return;
    const midX = (l.bbox.x0 + l.bbox.x1) / 2;
    const xPct = ((midX / maxX) * 100).toFixed(1);
    const yPct = ((l.bbox.y0 / maxY) * 100).toFixed(1);
    const side = midX > maxX * 0.42 ? 'RIGHT(我)' : 'LEFT(对方)';
    console.log(`[y${yPct}% x${xPct}%] ${side} bbox:(${l.bbox.x0.toFixed(0)},${l.bbox.y0.toFixed(0)})-(${l.bbox.x1.toFixed(0)},${l.bbox.y1.toFixed(0)}) "${l.text.trim()}"`);
  });
  
  console.log('\n=== FULL TEXT ===');
  console.log(data.text);
  
  await worker.terminate();
})().catch(e => console.error(e));
