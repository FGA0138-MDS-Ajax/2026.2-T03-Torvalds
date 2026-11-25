import { describe, expect, it } from 'vitest'
import { contarUrgentes, ehUrgente } from './notificacoesUtils'

const agora = new Date('2026-11-10T12:00:00')

describe('notificações', () => {
  it('considera urgente a entrega atrasada ou com prazo em até 48 horas', () => {
    expect(
      ehUrgente({ atrasada: true, prazo: '2026-10-01T10:00:00' }, agora),
    ).toBe(true)
    expect(
      ehUrgente({ atrasada: false, prazo: '2026-11-11T23:59:00' }, agora),
    ).toBe(true)
    expect(
      ehUrgente({ atrasada: false, prazo: '2026-11-12T11:00:00' }, agora),
    ).toBe(true)
  })

  it('não considera urgente o que ainda está longe', () => {
    expect(
      ehUrgente({ atrasada: false, prazo: '2026-11-13T09:00:00' }, agora),
    ).toBe(false)
    expect(ehUrgente({ atrasada: false, prazo: 'invalida' }, agora)).toBe(false)
  })

  it('conta só as urgentes', () => {
    expect(
      contarUrgentes(
        [
          { atrasada: true, prazo: '2026-10-01T10:00:00' },
          { atrasada: false, prazo: '2026-11-11T23:59:00' },
          { atrasada: false, prazo: '2026-12-01T10:00:00' },
        ],
        agora,
      ),
    ).toBe(2)
    expect(contarUrgentes([], agora)).toBe(0)
  })
})
