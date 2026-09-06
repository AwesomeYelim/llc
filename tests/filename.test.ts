import { describe, it, expect } from 'vitest'
import { fileKey } from '../scripts/lib/filename.mjs'

// macOS 파일시스템이 돌려주는 이름(NFD)과 파일서버 cron 이 올린 이름(NFC).
// 눈에는 같지만 바이트가 다르다.
const NFD = '202512_송구영신.zip'.normalize('NFD')
const NFC = '202512_송구영신.zip'.normalize('NFC')

describe('fileKey', () => {
  it('전제: NFD 와 NFC 는 그냥 비교하면 다르다', () => {
    expect(NFD).not.toBe(NFC)
    expect(NFD.length).toBeGreaterThan(NFC.length)
  })

  it('같은 파일이면 NFD/NFC 어느 쪽이든 같은 키가 된다', () => {
    expect(fileKey(NFD)).toBe(fileKey(NFC))
  })

  it('Set/Map 조회에서 중복을 걸러낸다', () => {
    const seen = new Set([fileKey(NFC)])
    expect(seen.has(fileKey(NFD))).toBe(true)
    expect(seen.has(NFD)).toBe(false) // 정규화 없이는 못 걸러진다
  })

  it('한글이 없는 이름은 그대로 둔다', () => {
    expect(fileKey('sun_202609_1.zip')).toBe('sun_202609_1.zip')
  })

  it('확장자를 바꿔도 키가 유지된다 (.key ↔ .pdf 매핑용)', () => {
    const key = '(G_원합니다)더원합니다.key'
    expect(fileKey(key.normalize('NFD'))).toBe(fileKey(key.normalize('NFC')))
  })
})
