import { MultiSelect, Popover, type Primitive, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import type { ReactNode } from "react"

import classes from './CombatBuffsDrawer.module.css'

interface BaseProps<T> {
  options: Array<T>,
  value: Array<T>,
  onChange(values: Array<T>): void,
  renderPills(tag: { value?: T }): ReactNode
  renderOptions(option: { option: { value: T }, checked?: boolean }): ReactNode
  disabled?: boolean
  label?: string
}

interface WithPopoverProps<T> extends BaseProps<T> {
  withPopover: true,
  popoverText: string
}

interface WithoutPopoverProps<T> extends BaseProps<T> {
  withPopover?: false
  popoverText?: string
}

export type PillMultiSelectProps<T extends Primitive> = WithPopoverProps<T> | WithoutPopoverProps<T>
export function PillMultiSelect<T extends Primitive>({
  options,
  value,
  onChange,
  renderPills,
  renderOptions,
  withPopover,
  popoverText,
  disabled,
  label
}: PillMultiSelectProps<T>) {
  const [opened, { close, open }] = useDisclosure(false)
  return withPopover ? (
    <Popover width={200} position='left' withArrow shadow='md' opened={opened} disabled={!disabled}>
      <Popover.Target>
        {/* div required to capture mouse events, these events arent captured by multiselect if it is disabled */}
        <div
          onMouseEnter={open}
          onMouseLeave={close}
        >
          <TagSelector
            value={value}
            onChange={onChange}
            options={options}
            renderPills={renderPills}
            renderOptions={renderOptions}
            label={label}
            disabled={disabled}
          />
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size='sm'>{popoverText}</Text>
      </Popover.Dropdown>
    </Popover>
  ) : (
    <TagSelector
      value={value}
      onChange={onChange}
      options={options}
      renderPills={renderPills}
      renderOptions={renderOptions}
      label={label}
      disabled={disabled}
    />
  )
}

function TagSelector<T extends Primitive>({
  value,
  label,
  onChange,
  options,
  renderOptions: renderOption,
  renderPills: renderPill,
  disabled
}: BaseProps<T>) {
  return <MultiSelect
    value={value}
    onChange={onChange}
    data={options}
    clearable
    renderPill={renderPill}
    renderOption={renderOption}
    classNames={{ dropdown: classes.dropdown, option: classes.option }}
    label={label}
    disabled={disabled}
  />
}