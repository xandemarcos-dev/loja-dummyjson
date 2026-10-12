import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const isDark = computed === 'dark';

  return (
    <ActionIcon
      variant="default"
      size="lg"
      radius="md"
      onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Usar tema claro' : 'Usar tema escuro'}
    >
      {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  );
}
