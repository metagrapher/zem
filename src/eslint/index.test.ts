import { describe, it, expect } from 'vitest'
import { rules, configs } from './index'

describe('index', () => {
    it('rules should correspond to requirements', () => {
        expect(rules).toBeDefined()
    })

    it('configs should correspond to requirements', () => {
        expect(configs).toBeDefined()
    })

})
