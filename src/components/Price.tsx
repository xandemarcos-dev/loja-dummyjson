import { Text, type TextProps } from '@mantine/core';

const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' });

export function formatPrice(value: number): string {
  return formatter.format(value);
}

interface PriceProps extends TextProps {
  value: number;
}

export function Price({ value, ...textProps }: PriceProps) {
  return (
    <Text fw={700} {...textProps}>
      {formatPrice(value)}
    </Text>
  );
}
