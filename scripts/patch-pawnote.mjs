import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const targets = [
  path.join(root, 'node_modules', 'pawnote', 'dist', 'index.mjs'),
  path.join(root, 'node_modules', 'pawnote', 'dist', 'index.js'),
]

const from = 's="Start(",t=")}catch",i=e.substring(e.indexOf(s)+s.length,e.indexOf(t))'
const to =
  's="Start(",_si=e.indexOf(s),_ei=e.indexOf(")}catch",_si),_ej=e.indexOf(");}catch",_si),_end=(_ej>=0&&(_ei<0||_ej<_ei))?_ej:_ei,i=e.substring(_si+s.length,_end)'

let patched = 0
for (const file of targets) {
  try {
    const source = await readFile(file, 'utf8')
    if (source.includes(to)) continue
    if (!source.includes(from)) {
      console.warn(`[patch-pawnote] pattern not found in ${path.relative(root, file)}`)
      continue
    }
    await writeFile(file, source.replaceAll(from, to))
    patched += 1
  } catch (cause) {
    console.warn(`[patch-pawnote] skip ${path.relative(root, file)}:`, cause?.message)
  }
}
console.log(`[patch-pawnote] patched ${patched} file(s)`)
