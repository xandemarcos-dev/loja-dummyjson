import type { ReactNode } from 'react';
import { Alert, Button, Stack } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  children?: ReactNode;
}

export function ErrorState({ message, onRetry, children }: ErrorStateProps) {
  return (
    <Alert color="red" variant="light" title="Algo deu errado" icon={<IconAlertTriangle size={18} />} role="alert">
      <Stack gap="sm" align="flex-start">
        {message}
        {children}
        {onRetry && (
          <Button size="xs" variant="white" color="red" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </Stack>
    </Alert>
  );
}
