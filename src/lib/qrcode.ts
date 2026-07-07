/**
 * Minimal QR Code generator — pure TypeScript, zero dependencies.
 * Generates a QR code as a data URL (PNG via canvas).
 * Supports alphanumeric mode, error correction level M, versions 1-10.
 */

// ── GF(256) arithmetic for Reed-Solomon ──────────────────────
const GF_EXP = new Uint8Array(512)
const GF_LOG = new Uint8Array(256)

;(function initGalois() {
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x
    GF_LOG[x] = i
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0)
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255]
})()

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return GF_EXP[GF_LOG[a] + GF_LOG[b]]
}

function rsGenPoly(nsym: number): Uint8Array {
  let g = new Uint8Array([1])
  for (let i = 0; i < nsym; i++) {
    const next = new Uint8Array(g.length + 1)
    const factor = GF_EXP[i]
    for (let j = 0; j < g.length; j++) {
      next[j] ^= g[j]
      next[j + 1] ^= gfMul(g[j], factor)
    }
    g = next
  }
  return g
}

function rsEncode(data: Uint8Array, nsym: number): Uint8Array {
  const gen = rsGenPoly(nsym)
  const out = new Uint8Array(data.length + nsym)
  out.set(data)
  for (let i = 0; i < data.length; i++) {
    const coef = out[i]
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        out[i + j] ^= gfMul(gen[j], coef)
      }
    }
  }
  return out.slice(data.length)
}

// ── QR Code Data Encoding (Byte mode) ───────────────────────
type ECLevel = 'L' | 'M' | 'Q' | 'H'

// [total codewords, ec codewords per block, num blocks group1, data cw group1, num blocks group2, data cw group2]
const EC_TABLE: Record<string, number[][]> = {
  'M': [
    /* v1 */ [26, 10, 1, 16, 0, 0],
    /* v2 */ [44, 16, 1, 28, 0, 0],
    /* v3 */ [70, 26, 1, 44, 0, 0],
    /* v4 */ [100, 18, 2, 32, 0, 0],
    /* v5 */ [134, 24, 2, 43, 0, 0],
    /* v6 */ [172, 16, 4, 27, 0, 0],
    /* v7 */ [196, 18, 4, 31, 0, 0],
    /* v8 */ [242, 22, 2, 38, 2, 39],
    /* v9 */ [292, 22, 3, 36, 2, 37],
    /* v10 */ [346, 26, 4, 43, 1, 44],
    /* v11 */ [404, 30, 1, 50, 4, 51],
    /* v12 */ [466, 22, 6, 36, 2, 37],
    /* v13 */ [532, 22, 8, 37, 1, 38],
    /* v14 */ [581, 24, 4, 40, 5, 41],
    /* v15 */ [655, 24, 5, 41, 5, 42],
    /* v16 */ [733, 28, 7, 45, 3, 46],
    /* v17 */ [815, 28, 10, 46, 1, 47],
    /* v18 */ [901, 26, 9, 43, 4, 44],
    /* v19 */ [991, 26, 3, 44, 11, 45],
    /* v20 */ [1085, 26, 3, 41, 13, 42],
  ]
}

function getVersion(dataLen: number): number {
  const table = EC_TABLE['M']
  for (let v = 0; v < table.length; v++) {
    const [totalCw, ecCw, nb1, dcw1, nb2, dcw2] = table[v]
    const dataCap = nb1 * dcw1 + nb2 * dcw2
    // byte mode header: 4 bits mode + char count bits
    const ccBits = v + 1 < 10 ? 8 : 16
    const headerBits = 4 + ccBits
    const availBits = dataCap * 8
    if (dataLen * 8 + headerBits <= availBits) return v + 1
  }
  return 20 // max supported
}

function encodeData(text: string, version: number): Uint8Array {
  const table = EC_TABLE['M'][version - 1]
  const [totalCw, ecCwPerBlock, nb1, dcw1, nb2, dcw2] = table
  const totalDataCw = nb1 * dcw1 + nb2 * dcw2

  const ccBits = version < 10 ? 8 : 16
  const bits: number[] = []
  
  // Mode indicator: byte mode = 0100
  bits.push(0, 1, 0, 0)
  
  // Character count
  const len = text.length
  for (let i = ccBits - 1; i >= 0; i--) bits.push((len >> i) & 1)
  
  // Data
  for (let i = 0; i < len; i++) {
    const byte = text.charCodeAt(i) & 0xff
    for (let b = 7; b >= 0; b--) bits.push((byte >> b) & 1)
  }
  
  // Terminator
  const maxBits = totalDataCw * 8
  for (let i = 0; i < 4 && bits.length < maxBits; i++) bits.push(0)
  
  // Pad to byte boundary
  while (bits.length % 8 !== 0 && bits.length < maxBits) bits.push(0)
  
  // Padding bytes
  const padBytes = [0xec, 0x11]
  let padIdx = 0
  while (bits.length < maxBits) {
    const pb = padBytes[padIdx % 2]
    for (let b = 7; b >= 0; b--) bits.push((pb >> b) & 1)
    padIdx++
  }
  
  // Convert to bytes
  const dataBytes = new Uint8Array(totalDataCw)
  for (let i = 0; i < totalDataCw; i++) {
    let byte = 0
    for (let b = 0; b < 8; b++) byte = (byte << 1) | (bits[i * 8 + b] || 0)
    dataBytes[i] = byte
  }

  // Split into blocks and compute EC
  const blocks: Uint8Array[] = []
  const ecBlocks: Uint8Array[] = []
  let offset = 0

  for (let g = 0; g < 2; g++) {
    const numBlocks = g === 0 ? nb1 : nb2
    const blockSize = g === 0 ? dcw1 : dcw2
    for (let b = 0; b < numBlocks; b++) {
      const block = dataBytes.slice(offset, offset + blockSize)
      blocks.push(block)
      ecBlocks.push(rsEncode(block, ecCwPerBlock))
      offset += blockSize
    }
  }

  // Interleave data
  const result: number[] = []
  const maxBlockLen = Math.max(dcw1, dcw2 || 0)
  for (let i = 0; i < maxBlockLen; i++) {
    for (const block of blocks) {
      if (i < block.length) result.push(block[i])
    }
  }
  // Interleave EC
  for (let i = 0; i < ecCwPerBlock; i++) {
    for (const ecBlock of ecBlocks) {
      if (i < ecBlock.length) result.push(ecBlock[i])
    }
  }

  return new Uint8Array(result)
}

// ── Matrix placement ─────────────────────────────────────────
const ALIGNMENT_POSITIONS: Record<number, number[]> = {
  2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34],
  7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
  11: [6, 30, 54], 12: [6, 32, 58], 13: [6, 34, 62], 14: [6, 26, 46, 66],
  15: [6, 26, 48, 70], 16: [6, 26, 50, 74], 17: [6, 30, 54, 78],
  18: [6, 30, 56, 82], 19: [6, 30, 58, 86], 20: [6, 34, 62, 90],
}

function createMatrix(version: number): { matrix: number[][], reserved: boolean[][] } {
  const size = version * 4 + 17
  const matrix = Array.from({ length: size }, () => new Array(size).fill(0))
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false))

  // Finder patterns
  function placeFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r, cc = col + c
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue
        const isBlack = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                        (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                        (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        matrix[rr][cc] = isBlack ? 1 : 0
        reserved[rr][cc] = true
      }
    }
  }
  placeFinder(0, 0)
  placeFinder(0, size - 7)
  placeFinder(size - 7, 0)

  // Alignment patterns
  if (version >= 2) {
    const positions = ALIGNMENT_POSITIONS[version] || []
    for (const r of positions) {
      for (const c of positions) {
        // Skip if overlapping finder
        if (r <= 8 && c <= 8) continue
        if (r <= 8 && c >= size - 8) continue
        if (r >= size - 8 && c <= 8) continue
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBlack = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)
            matrix[r + dr][c + dc] = isBlack ? 1 : 0
            reserved[r + dr][c + dc] = true
          }
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0
    reserved[6][i] = true
    matrix[i][6] = i % 2 === 0 ? 1 : 0
    reserved[i][6] = true
  }

  // Dark module
  matrix[size - 8][8] = 1
  reserved[size - 8][8] = true

  // Reserve format info areas
  for (let i = 0; i < 9; i++) {
    if (i < size) { reserved[8][i] = true; reserved[i][8] = true }
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = true
    reserved[size - 1 - i][8] = true
  }

  // Reserve version info areas (v7+)
  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        reserved[i][size - 11 + j] = true
        reserved[size - 11 + j][i] = true
      }
    }
  }

  return { matrix, reserved }
}

function placeData(matrix: number[][], reserved: boolean[][], data: Uint8Array) {
  const size = matrix.length
  const bits: number[] = []
  for (const byte of data) {
    for (let b = 7; b >= 0; b--) bits.push((byte >> b) & 1)
  }
  
  let bitIdx = 0
  let upward = true
  
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5 // Skip timing column
    
    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i)
    
    for (const row of rows) {
      for (const c of [col, col - 1]) {
        if (c < 0 || c >= size) continue
        if (!reserved[row][c]) {
          matrix[row][c] = bitIdx < bits.length ? bits[bitIdx++] : 0
        }
      }
    }
    upward = !upward
  }
}

// ── Masking ──────────────────────────────────────────────────
const MASK_FNS = [
  (r: number, c: number) => (r + c) % 2 === 0,
  (r: number, _c: number) => r % 2 === 0,
  (_r: number, c: number) => c % 3 === 0,
  (r: number, c: number) => (r + c) % 3 === 0,
  (r: number, c: number) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r: number, c: number) => ((r * c) % 2 + (r * c) % 3) === 0,
  (r: number, c: number) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
  (r: number, c: number) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
]

function applyMask(matrix: number[][], reserved: boolean[][], maskIdx: number): number[][] {
  const size = matrix.length
  const result = matrix.map(row => [...row])
  const fn = MASK_FNS[maskIdx]
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c] && fn(r, c)) {
        result[r][c] ^= 1
      }
    }
  }
  return result
}

// ── Format info ──────────────────────────────────────────────
const FORMAT_MASK = 0x5412

function getFormatBits(ecLevel: ECLevel, maskPattern: number): number {
  const ecBits = { L: 1, M: 0, Q: 3, H: 2 }[ecLevel]
  let data = (ecBits << 3) | maskPattern
  let d = data
  for (let i = 0; i < 10; i++) {
    d = (d << 1) ^ ((d & 0x200) ? 0x537 : 0)
  }
  return ((data << 10) | d) ^ FORMAT_MASK
}

function placeFormatInfo(matrix: number[][], formatBits: number) {
  const size = matrix.length
  const bits = []
  for (let i = 14; i >= 0; i--) bits.push((formatBits >> i) & 1)
  
  // Around top-left finder
  const positions1 = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ]
  // Bottom-left and top-right
  const positions2 = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8],
    [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5],
    [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1]
  ]
  
  for (let i = 0; i < 15; i++) {
    const [r1, c1] = positions1[i]
    matrix[r1][c1] = bits[i]
    const [r2, c2] = positions2[i]
    matrix[r2][c2] = bits[i]
  }
}

// ── Penalty scoring (simplified) ─────────────────────────────
function penaltyScore(matrix: number[][]): number {
  const size = matrix.length
  let score = 0
  
  // Rule 1: consecutive same-color in rows/cols
  for (let r = 0; r < size; r++) {
    let count = 1
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) {
        count++
        if (count === 5) score += 3
        else if (count > 5) score += 1
      } else {
        count = 1
      }
    }
  }
  for (let c = 0; c < size; c++) {
    let count = 1
    for (let r = 1; r < size; r++) {
      if (matrix[r][c] === matrix[r - 1][c]) {
        count++
        if (count === 5) score += 3
        else if (count > 5) score += 1
      } else {
        count = 1
      }
    }
  }
  
  // Rule 2: 2x2 blocks of same color
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const val = matrix[r][c]
      if (val === matrix[r][c + 1] && val === matrix[r + 1][c] && val === matrix[r + 1][c + 1]) {
        score += 3
      }
    }
  }
  
  return score
}

// ── Main QR generation ───────────────────────────────────────
function generateQRMatrix(text: string): number[][] {
  const version = getVersion(text.length)
  const data = encodeData(text, version)
  const { matrix, reserved } = createMatrix(version)
  
  placeData(matrix, reserved, data)
  
  // Try all masks, pick lowest penalty
  let bestMask = 0
  let bestPenalty = Infinity
  let bestMatrix = matrix
  
  for (let m = 0; m < 8; m++) {
    const masked = applyMask(matrix, reserved, m)
    const formatBits = getFormatBits('M', m)
    placeFormatInfo(masked, formatBits)
    const p = penaltyScore(masked)
    if (p < bestPenalty) {
      bestPenalty = p
      bestMask = m
      bestMatrix = masked
    }
  }
  
  // Apply best mask
  const final = applyMask(matrix, reserved, bestMask)
  const formatBits = getFormatBits('M', bestMask)
  placeFormatInfo(final, formatBits)
  
  return final
}

/**
 * Generate a QR code as a data:image/png;base64 URL.
 * @param text The text/URL to encode
 * @param moduleSize Pixel size of each QR module (default 8)
 * @param quietZone Number of quiet zone modules around the QR (default 4)
 * @returns A data URL string for use in <img> src
 */
export function generateQRDataURL(text: string, moduleSize = 8, quietZone = 4): string {
  const matrix = generateQRMatrix(text)
  const size = matrix.length
  const imageSize = (size + quietZone * 2) * moduleSize
  
  const canvas = document.createElement('canvas')
  canvas.width = imageSize
  canvas.height = imageSize
  const ctx = canvas.getContext('2d')!
  
  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, imageSize, imageSize)
  
  // Draw modules
  ctx.fillStyle = '#000000'
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        ctx.fillRect(
          (c + quietZone) * moduleSize,
          (r + quietZone) * moduleSize,
          moduleSize,
          moduleSize
        )
      }
    }
  }
  
  return canvas.toDataURL('image/png')
}
