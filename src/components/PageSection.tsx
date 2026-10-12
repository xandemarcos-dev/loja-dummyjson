import type { ReactNode } from 'react';
import { Group, Stack, Text, Title } from '@mantine/core';

interface PageSectionProps {
  title: string;
  description?: string;
  /** Ações exibidas à direita do título (botões, filtros). */
  actions?: ReactNode;
  children: ReactNode;
}

/** Moldura padrão das páginas: título, descrição opcional e o conteúdo via children. */
export function PageSection({ title, description, actions, children }: PageSectionProps) {
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
        <div>
          <Title order={1} size="h2">
            {title}
          </Title>
          {description && (
            <Text c="dimmed" size="sm" mt={4}>
              {description}
            </Text>
          )}
        </div>
        {actions}
      </Group>
      {children}
    </Stack>
  );
}
