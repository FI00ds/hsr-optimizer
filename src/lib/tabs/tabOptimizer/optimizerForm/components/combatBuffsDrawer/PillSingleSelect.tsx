import {
  Combobox,
  Popover,
  type Primitive,
  Text,
  useCombobox,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReactNode } from 'react';

namespace PillSingleSelect {
  export interface CoreProps<T> {
    options: Array<T>
    value: T
    onChange: (value: T) => void
    renderValue: (value: T) => ReactNode,
    renderOption: (value: T, checked: boolean) => ReactNode,
    disabled?: boolean,
    label?: string
  }

  export type PopoverProps = {
    withPopover?: false,
    popoverText?: string
  } | {
    withPopover: true,
    popoverText: string
  }

  export type Props<T extends Primitive> = CoreProps<T> & PopoverProps
}

export function PillSingleSelect<T extends Primitive>({
  withPopover,
  popoverText,
  ...rest
}: PillSingleSelect.Props<T>) {
  const hidePopover = rest.disabled !== true
  const [opened, { open, close }] = useDisclosure()
  return withPopover ? (
    <Popover width={200} position='left' withArrow shadow='md' opened={opened} disabled={hidePopover}>
      <Popover.Target>
        <div onMouseEnter={open} onMouseLeave={close}>
          <PillSingleSelectTarget {...rest} />
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size='sm'>{popoverText}</Text>
      </Popover.Dropdown>
    </Popover>
  ) : <PillSingleSelectTarget {...rest} />
}

function PillSingleSelectTarget<T extends Primitive>({ options }: PillSingleSelect.CoreProps<T>) {
  const combobox = useCombobox()
  return (
    <Combobox store={combobox}></Combobox>
  )
}