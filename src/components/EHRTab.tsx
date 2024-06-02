import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Utils } from 'lib/utils'
import { Button, Flex, Form, Input, Image, InputNumber, Modal, Radio, Select, List, Typography, theme } from 'antd'
import { HeaderText } from './HeaderText'
import { FormInstance } from 'antd/es/form/hooks/useForm'
import { isatty } from 'tty'

type debuff = 'burn' | 'bleed' | 'freeze' | 'wind shear' | 'shock' | 'entangle' | 'imprison' | 'other'

const InputNumberStyled = styled(InputNumber)`
    width: 90px
`

export default function EHRTab() {
  const [EHRForm] = Form.useForm()

  const [targets, setTargets] = useState({
    character: '1001',
    eidolon: 0,
    superimposition: 5,
    lightcone: '21015',
  })

  const teammates = [Form.useWatch('teammate1', EHRForm), Form.useWatch('teammate2', EHRForm), Form.useWatch('teammate3', EHRForm)]

  const characters = Utils.generateCharacterOptions()

  const lightcones = Utils.generateLightConeOptions()

  const [effects, setEffects] = useState(calculateEffects(0, 1001, 5, 21015))

  const updateValues = () => { // useWatch triggers after onChange it looks like, so I have to use getFieldValue :/
    setTargets({
      character: EHRForm.getFieldValue('character') ? EHRForm.getFieldValue('character') : '1001',
      eidolon: EHRForm.getFieldValue('eidolon') ? EHRForm.getFieldValue('eidolon') : 0,
      superimposition: EHRForm.getFieldValue('superimposition') ? EHRForm.getFieldValue('superimposition') : 5,
      lightcone: EHRForm.getFieldValue('lightcone') ? EHRForm.getFieldValue('lightcone') : '21015',
    })
    setEffects(calculateEffects(
      EHRForm.getFieldValue('eidolon') ? EHRForm.getFieldValue('eidolon') : 0,
      parseInt(EHRForm.getFieldValue('character') ? EHRForm.getFieldValue('character') : '1001'),
      EHRForm.getFieldValue('superimposition') ? EHRForm.getFieldValue('superimposition') : 5,
      parseInt(EHRForm.getFieldValue('lightcone') ? EHRForm.getFieldValue('lightcone') : '21015'),
    ))
  }

  return (
    <Form
      form={EHRForm}
      name="EHRForm"
      layout="vertical"
      preserve={false}
      style={{ margin: 'auto' }}
    >
      <Flex vertical gap={20}>
        <Flex justify="center">
          <HeaderText>EHR Calculator</HeaderText>
        </Flex>
        <Flex gap={30}>
          <Flex vertical gap={10}>
            <HeaderText>Character Effects</HeaderText>
          </Flex>
          <Flex vertical gap={10}>
            <HeaderText>Character Selection</HeaderText>
            <Form.Item name="character">
              <Select
                onChange={updateValues}
                options={characters}
                defaultValue="1001"
              />
            </Form.Item>
            <Form.Item name="eidolon">
              <Select
                onChange={updateValues}
                options={[{ value: 0, label: 'E0' }, { value: 1, label: 'E1' }, { value: 2, label: 'E2' }, { value: 3, label: 'E3' }, { value: 4, label: 'E4' }, { value: 5, label: 'E5' }, { value: 6, label: 'E6' }]}
                defaultValue={0}
              />
            </Form.Item>
          </Flex>
          <Flex vertical gap={10}>
            <HeaderText>lightcone Selection</HeaderText>
            <Form.Item name="lightcone">
              <Select
                onChange={updateValues}
                options={lightcones}
                defaultValue="21015"
              />
            </Form.Item>
            <Form.Item name="superimposition">
              <Select
                onChange={updateValues}
                options={[{ value: 1, label: 'S1' }, { value: 2, label: 'S2' }, { value: 3, label: 'S3' }, { value: 4, label: 'S4' }, { value: 5, label: 'S5' }]}
                defaultValue={5}
              />
            </Form.Item>
          </Flex>
          <Flex vertical gap={10}>
            <HeaderText>Teammate Selection</HeaderText>
            <Form.Item name="teammate1">
              <Select
                options={characters}
              />
            </Form.Item>
            <Form.Item name="teammate2">
              <Select
                options={characters}
              />
            </Form.Item>
            <Form.Item name="teammate3">
              <Select
                options={characters}
              />
            </Form.Item>
          </Flex>
          <Flex vertical gap={10}>
            <HeaderText>Teammate Buffs</HeaderText>
          </Flex>
        </Flex>
        <Flex justify="center" gap={20}>
          <Flex vertical gap={10}>
            <HeaderText>Enemy</HeaderText>
            <Form.Item name="enemy">
              <InputNumberStyled controls={false} />
            </Form.Item>
          </Flex>
          <Flex vertical gap={10}>
            <HeaderText>Enemy Level</HeaderText>
            <Form.Item name="enemy level">
              <InputNumberStyled
                controls={false}
                max={95}
                min={1}
              />
            </Form.Item>
          </Flex>
        </Flex>
        <Flex justify="center">
          <Flex vertical gap={20}>
            <HeaderText>{effects.character[0].label}</HeaderText>
            <HeaderText>{targets.character}</HeaderText>
            <HeaderText>{targets.eidolon}</HeaderText>
            <HeaderText>{targets.lightcone}</HeaderText>
            <HeaderText>{targets.superimposition}</HeaderText>
            <HeaderText>{effects.lightcone[0].chance}</HeaderText>
          </Flex>
        </Flex>
      </Flex>
    </Form>
  )
}

function calculateEffects(eidolon: number, characterID: number, superimposition: number, lightconeID: number) {
  let character: { trigger: { type: string; isattack: boolean }[]; chance: number; label: string; fixed: boolean; type: debuff }[] = [
    { trigger: [{ type: 'none', isattack: false }], chance: 0, label: 'no debuffs', fixed: true, type: 'other' },
  ]
  let lightcone: { trigger: { type: string; isattack: boolean }[]; chance: number; label: string; fixed: boolean; type: debuff }[] = [
    { trigger: [{ type: 'none', isattack: false }], chance: 0, label: 'no debuffs', fixed: true, type: 'other' },
  ]
  switch (characterID) {
    case 8004: // Preservation MC
      character = [{ trigger: [{ type: 'skill', isattack: false }], chance: 1.00, label: 'skill taunt', fixed: false, type: 'other' }]
      break
    case 8003: // Preservation MC
      character = [{ trigger: [{ type: 'skill', isattack: false }], chance: 1.00, label: 'skill taunt', fixed: false, type: 'other' }]
      break
    case 1209: // Yanqing
      character = [
        { trigger: [{ type: 'FUA', isattack: true }], chance: 0.65, label: 'FUA freeze', fixed: false, type: 'freeze' },
        { trigger: [{ type: 'skill', isattack: true }, { type: 'basic', isattack: true }, { type: 'ultimate', isattack: true }], chance: (0.60 + eidolon >= 2 ? 0.2 : 0), label: 'FUA', fixed: true, type: 'other' },
      ]
      break
    case 1109: // Hook
      character = [
        { trigger: [{ type: 'skill', isattack: true }], chance: 1.00, label: 'skill burn', fixed: false, type: 'burn' },
        { trigger: [{ type: 'technique', isattack: true }], chance: 1.00, label: 'technique burn', fixed: false, type: 'burn' },
      ]
      if (eidolon >= 4) character.push({ trigger: [{ type: 'skill', isattack: true }, { type: 'basic', isattack: true }, { type: 'ultimate', isattack: true }], chance: 1.00, label: 'talent burn', fixed: false, type: 'burn' })
      break
    case 1108: // Sampo
      character = [
        { trigger: [{ type: 'skill', isattack: true }, { type: 'basic', isattack: true }, { type: 'ultimate', isattack: true }], chance: 0.65, label: 'talent wind shear', fixed: false, type: 'wind shear' },
        { trigger: [{ type: 'ultimate', isattack: true }], chance: 1.00, label: 'ultimate DOT vulnerability', fixed: false, type: 'other' },
        { trigger: [{ type: 'technique', isattack: false }], chance: 1.00, label: 'technique delay', fixed: false, type: 'other' },
      ]
      if (eidolon >= 2) character.push({ trigger: [{ type: 'enemy-defeated', isattack: false }], chance: 1.00, label: 'wind shear on enemy defeated', fixed: false, type: 'wind shear' })
      break
    case 1106: // Pela
      character = [
        { trigger: [{ type: 'ultimate', isattack: true }], chance: 1.00, label: 'ultimate def shred', fixed: false, type: 'other' },
        { trigger: [{ type: 'technique', isattack: true }], chance: 1.00, label: 'technique def shred', fixed: false, type: 'other' },
      ]
      if (eidolon >= 4) character.push({ trigger: [{ type: 'skill', isattack: true }], chance: 1.00, label: 'skill ice res shred', fixed: false, type: 'other' })
      break
    case 1104: // Gepard
      character = [{ trigger: [{ type: 'skill', isattack: true }], chance: (eidolon >= 1 ? 1.00 : 0.65), label: 'skill freeze', fixed: false, type: 'freeze' }]
      break
    case 1103: // Serval
      character = [
        { trigger: [{ type: 'skill', isattack: true }], chance: 1.00, label: 'skill shock', fixed: false, type: 'shock' },
        { trigger: [{ type: 'technique', isattack: true }], chance: 1.00, label: 'technique shock', fixed: false, type: 'shock' },
      ]
      if (eidolon >= 4) character.push({ trigger: [{ type: 'ultimate', isattack: true }], chance: 1.00, label: 'ultimate shock', fixed: false, type: 'shock' })
      break
    case 1009: // Asta
      character = [{ trigger: [{ type: 'basic', isattack: true }], chance: 0.80, label: 'basic attack burn', fixed: false, type: 'burn' }]
      break
    case 1004: // Welt
      character = [
        { trigger: [{ type: 'skill', isattack: true }], chance: 0.75 + (eidolon >= 3 ? 0.02 : 0) + (eidolon >= 4 ? 0.35 : 0), label: 'skill slow', fixed: false, type: 'other' },
        { trigger: [{ type: 'ultimate', isattack: true }], chance: 1.00, label: 'ultimate imprison', fixed: false, type: 'imprison' },
        { trigger: [{ type: 'ultimate', isattack: true }], chance: 1.00, label: 'ultimate vulnerability', fixed: false, type: 'other' },
        { trigger: [{ type: 'technique', isattack: false }], chance: 1.00, label: 'technique imprison', fixed: false, type: 'imprison' },
      ]
      break
    case 1003: // Himeko
      character = [
        { trigger: [{ type: 'skill', isattack: true }, { type: 'basic', isattack: true }, { type: 'ultimate', isattack: true }, { type: 'FUA', isattack: true }], chance: 0.5, label: 'talent burn', fixed: false, type: 'burn' },
        { trigger: [{ type: 'technique', isattack: false }], chance: 1.00, label: 'technique fire dmg vulnerability', fixed: false, type: 'other' },
      ]
      break
    case 1002: // Dan Heng
      character = [{ trigger: [{ type: 'skill', isattack: true }], chance: 1.00, label: 'skill slow', fixed: false, type: 'other' }]
      break
    case 1001: // March 7th
      character = [
        { trigger: [{ type: 'ultimate', isattack: true }], chance: 0.65, label: 'ultimate freeze', fixed: false, type: 'freeze' },
        { trigger: [{ type: 'technique', isattack: true }], chance: 1.00, label: 'technique freeze', fixed: false, type: 'freeze' },
      ]
      break
    case 1006: // Silver Wolf
      character = [
        {
          trigger: [{ type: 'technique', isattack: true }, { type: 'basic', isattack: true }, { type: 'skill', isattack: true }, { type: 'ultimate', isattack: true }],
          chance: 0.72 + (eidolon >= 3 ? 0.022 : 0),
          label: 'talent bug implants',
          fixed: false,
          type: 'other',
        },
        { trigger: [{ type: 'enemy-broken', isattack: false }], chance: 0.65, label: 'bug implant on enemy broken', fixed: false, type: 'other' },
        { trigger: [{ type: 'ultimate', isattack: true }], chance: 1.00 + (eidolon >= 5 ? 0.03 : 0), label: 'ultimate def shred', fixed: false, type: 'other' },
        { trigger: [{ type: 'skill', isattack: true }], chance: 0.85 + (eidolon >= 3 ? 0.02 : 0), label: 'skill weakness implant', fixed: false, type: 'other' },
        { trigger: [{ type: 'skill', isattack: true }], chance: 1.00, label: 'skill additional all type res shred', fixed: false, type: 'other' },
      ]
      break
    case 1111: // Luka
      character = [
        { trigger: [{ type: 'skill', isattack: true }], chance: 1.00, label: 'skill bleed', fixed: false, type: 'bleed' },
        { trigger: [{ type: 'ultimate', isattack: true }], chance: 1.00, label: 'ultimate vulnerability', fixed: false, type: 'other' },
        { trigger: [{ type: 'technique', isattack: true }], chance: 1.00, label: 'technique bleed', fixed: false, type: 'bleed' },
      ]
      break
    case 1005: // Kafka
      character = [
        { trigger: [{ type: 'technique', isattack: true }], chance: 1.30, label: 'technique shock', fixed: false, type: 'shock' },
        { trigger: [{ type: 'ultimate', isattack: true }], chance: 1.30, label: 'ultimate shock', fixed: false, type: 'shock' },
        { trigger: [{ type: 'FUA', isattack: true }], chance: 1.30, label: 'FUA shock', fixed: false, type: 'shock' },
      ]
      if (eidolon >= 1) character.push({ trigger: [{ type: 'FUA', isattack: true }], chance: 1.00, label: 'E1 FUA DOT vulnerability', fixed: false, type: 'other' })
      break
    case 1214: // Jingliu
      character = [{ trigger: [{ type: 'technique', isattack: false }], chance: 1.00, label: 'technique freeze', fixed: false, type: 'freeze' }]
      break
    case 1210: // Guinaifen
      character = [
        { trigger: [{ type: 'technique', isattack: true }], chance: 1.00, label: 'technique firekiss', fixed: false, type: 'other' },
        { trigger: [{ type: 'talent', isattack: false }, { type: 'ultimate', isattack: true }], chance: 1.00, label: 'firekiss application', fixed: false, type: 'other' },
        { trigger: [{ type: 'skill', isattack: true }], chance: 1.00, label: 'skill burn', fixed: false, type: 'burn' },
        { trigger: [{ type: 'basic', isattack: true }], chance: 0.80, label: 'basic attack burn', fixed: false, type: 'burn' },
      ]
      if (eidolon >= 1) character.push({ trigger: [{ type: 'skill', isattack: true }], chance: 1.00, label: 'skill effect res down', fixed: false, type: 'other' })
      break
    case 1305: // Dr. Veritas Ratio
      character = [
        { trigger: [{ type: 'skill', isattack: true }], chance: 1.00, label: 'skill effect res down', fixed: false, type: 'other' },
        { trigger: [{ type: 'technique', isattack: true }], chance: 1.00, label: 'technique speed down', fixed: false, type: 'other' },
      ]
      break
    case 1307: // Black Swan
      character = [
        { trigger: [{ type: 'technique', isattack: false }], chance: 1.50, label: 'technique 1st Arcana stack', fixed: false, type: 'wind shear' },
        { trigger: [{ type: 'technique', isattack: false }], chance: 1.00, label: 'technique 2nd Arcana stack', fixed: false, type: 'wind shear' },
        { trigger: [{ type: 'technique', isattack: false }], chance: 0.50, label: 'technique 3rd Arcana stack', fixed: false, type: 'wind shear' },
        { trigger: [{ type: 'ally-attack', isattack: false }], chance: 0.65, label: 'arcana from ally detonating DoT', fixed: false, type: 'wind shear' },
        { trigger: [{ type: 'enemy-spawn', isattack: false }], chance: 0.65, label: 'arcana on enemy entering battle', fixed: false, type: 'wind shear' },
        { trigger: [{ type: 'arcana-detonation', isattack: false }], chance: 0.65 + (eidolon > 3 ? 0.03 : 0), label: 'arcana spreads to adjacent enemies', fixed: false, type: 'wind shear' },
        { trigger: [{ type: 'enemy-turn', isattack: false }], chance: 0.65 + (eidolon > 3 ? 0.03 : 0), label: 'arcana when enemy takes DoT at start of turn', fixed: false, type: 'wind shear' },
        { trigger: [{ type: 'basic', isattack: true }], chance: 0.65 + (eidolon > 5 ? 0.03 : 0), label: 'arcana applied by basic', fixed: false, type: 'wind shear' },
        { trigger: [{ type: 'basic', isattack: true }], chance: 0.65 + (eidolon > 5 ? 0.03 : 0), label: 'additional arcana applied by basic', fixed: false, type: 'wind shear' },
        { trigger: [{ type: 'skill', isattack: true }], chance: 1.00, label: 'arcana applied by skill', fixed: false, type: 'wind shear' },
        { trigger: [{ type: 'skill', isattack: true }], chance: 1.00, label: 'skill def shred', fixed: false, type: 'other' },
        { trigger: [{ type: 'skill', isattack: true }], chance: 0.65, label: 'bonus arcana on skill', fixed: false, type: 'wind shear' },
      ]
      if (eidolon >= 2) character.push({ trigger: [{ type: 'enemy-defeated', isattack: false }], chance: 1.00, label: 'arcana spread on enemy defeated', fixed: false, type: 'wind shear' })
      if (eidolon >= 6) {
        character.push({ trigger: [{ type: 'ally-attack', isattack: false }], chance: 0.65, label: 'arcana when allies attack', fixed: false, type: 'wind shear' })
        character.push({ trigger: [{ type: 'arcana-applied', isattack: false }], chance: 0.50, label: 'bonus arcana on arcana applied', fixed: true, type: 'wind shear' })
      }
      break
    case 1312: // Misha
      character = [{ trigger: [{ type: 'ultimate', isattack: true }], chance: 1.00 + (eidolon >= 3 ? 0.016 : 0), label: 'ultimate freeze', fixed: false, type: 'freeze' }]
      if (eidolon >= 2) character.push({ trigger: [{ type: 'ultimate', isattack: true }], chance: 0.24, label: 'ultimate def shred', fixed: false, type: 'other' })
      break
  }
  switch (lightconeID) {
    case 23023: // Inherently Unjust Destiny
      lightcone = [{ trigger: [{ type: 'FUA', isattack: true }], chance: 1.00 + 0.15 * (superimposition - 1), label: 'Inherently Unjust Destiny vulnerability', fixed: false, type: 'other' }]
      break
    case 23007:
      lightcone = [{ trigger: [{ type: 'basic', isattack: true }, { type: 'skill', isattack: true }, { type: 'ultimate', isattack: true }], chance: 1.00, label: 'Aether Code', fixed: false, type: 'other' }]
      break
    case 23006:
      lightcone = [{ trigger: [{ type: 'attack', isattack: true }], chance: 1.00, label: 'Erode', fixed: false, type: 'other' }]
      break
    case 21031:
      lightcone = [{ trigger: [{ type: 'attack', isattack: true }], chance: 0.16 + 0.04 * (superimposition - 1), label: 'dispel', fixed: true, type: 'other' }]
      break
    case 21016:
      lightcone = [{ trigger: [{ type: 'hit', isattack: false }], chance: 1.00 + 0.05 * (superimposition - 1), label: 'Trends burn', fixed: false, type: 'burn' }]
      break
    case 21015:
      lightcone = [{ trigger: [{ type: 'attack', isattack: true }], chance: 0.6 + 0.1 * (superimposition - 1), label: 'Ensnared', fixed: false, type: 'other' }]
  }
  return {
    character: character,
    lightcone: lightcone,
  }
}
